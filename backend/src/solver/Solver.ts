import {
    action,
    createMachine,
    immediate,
    interpret,
    invoke,
    Machine,
    reduce,
    state,
    transition,
} from "robot3";
import { Game, Message, ShopItem, SolverContext } from "./types";
import { decryptMessage } from "./utils/encryption";
import { addProbabilityWeight } from "./utils/probability";

const STATUS_GAME_OVER = "game over";
const CONTEMPLATE_BUY_HEAL_ITEM_THRESHOLD = 1;
const CONTEMPLATE_BUY_ITEM_THRESHOLD = 400;

export default class Solver {
    private _api: string;
    // private _game!: Game;
    // private _scoreTarget?: number;
    private _machine;
    private _service;
    private _solveRes!: (g: Game) => void;
    private _solveRej!: (err: Error) => void;

    constructor(api: string) {
        this._api = api;
        const notAvailableTransition = transition(
            "not_available_received",
            "failed",
            reduce((ctx: SolverContext, ev: any) => ({
                ...ctx,
                game: { ...ctx.game, gameOver: false, available: false },
            }))
        );
        this._machine = createMachine({
            idle: state(
                transition(
                    "solve",
                    "loading_shop",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        ...ev.data,
                    }))
                )
            ),
            loading_shop: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/shop`),
                transition(
                    "done",
                    "loading_messages",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        shop: ev.data,
                    }))
                ),
                transition(
                    "error",
                    "failed",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        shop: [],
                    }))
                ),
                transition(
                    "game_over_received",
                    "failed",
                    reduce((ctx: SolverContext, ev: any) => ({
                        ...ctx,
                        game: { ...ctx.game, gameOver: true },
                    }))
                ),
                notAvailableTransition
            ),
            loading_messages: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/messages`),
                transition(
                    "done",
                    "contemplating",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        messages: ev.data
                            .map((msg: Message) => decryptMessage(msg))
                            .map((msg: Message) => addProbabilityWeight(msg))
                            //sort messages asc by complexityWeight
                            .sort(
                                (a: Message, b: Message) =>
                                    a.probabilityWeight < b.probabilityWeight
                            ),
                    }))
                ),
                transition(
                    "error",
                    "failed",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        messages: [],
                    }))
                ),
                transition(
                    "game_over_received",
                    "failed",
                    reduce((ctx: SolverContext, ev: any) => ({
                        ...ctx,
                        game: { ...ctx.game, gameOver: true },
                    }))
                ),
                notAvailableTransition
            ),
            contemplating: invoke(
                this.contemplate,
                transition(
                    "decided_to_shop",
                    "purchasing_item",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        shopItemId: ev.data.id,
                    }))
                ),
                transition(
                    "decided_to_solve_message",
                    "solving_message",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        messageId: ev.data.id,
                    }))
                ),
                transition("finished_solving", "idle")
            ),
            purchasing_item: invoke(
                this.fetchEndpoint(
                    `${this._api}/:gameId/shop/buy/:itemId`,
                    "POST"
                ),
                transition(
                    "done",
                    "loading_messages",
                    reduce((ctx: SolverContext, ev: any) => {
                        const { shoppingSuccess, ...rest } = ev.data;
                        return {
                            ...ctx,
                            game: { ...ctx.game, ...rest },
                        };
                    })
                ),
                notAvailableTransition
            ),
            solving_message: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/solve/:adId`, "POST"),
                transition(
                    "done",
                    "loading_messages",
                    reduce((ctx: SolverContext, ev: any) => {
                        const { success, message, ...rest } = ev.data;
                        return {
                            ...ctx,
                            game: { ...ctx.game, ...rest },
                        };
                    })
                ),
                notAvailableTransition
            ),
            solving: state(transition("solved", "solved")),
            solved: state(transition("turned_idle", "idle")),
            failed: invoke(
                (ctx: SolverContext) => {
                    this._solveRes(ctx.game);
                    this._service.send("turned_idle");
                    return Promise.resolve();
                },
                transition(
                    "turned_idle",
                    "idle",
                    action((ctx: SolverContext) => {
                        return ctx;
                    })
                )
            ),
        });
        this._service = interpret(this._machine, () => {
            // console.log(
            //     "Solver state changed to:",
            //     this._service.machine.current
            // );
        });
    }

    public solve(props: { game: Game; scoreTarget?: number }): Promise<any> {
        if (["idle", "solved"].includes(this._machine.current) !== true) {
            return Promise.reject("solver is busy");
        }
        console.log("Solver.solve props:", props);
        this._service.send({
            type: "solve",
            data: { game: props.game, scoreTarget: props.scoreTarget },
        });

        return new Promise((res, rej) => {
            this._solveRes = res;
            this._solveRej = rej;
            this._service.send("solve");
        });
    }

    private fetchEndpoint(
        endpointURL: string,
        method?: string
    ): (ctx: any) => Promise<unknown> {
        const options = {};
        if (method != null) {
            Object.assign(options, { method });
        }
        return (ctx) => {
            let finalURL = endpointURL.replace(":gameId", ctx.game.gameId);
            finalURL = finalURL.replace(":itemId", ctx.shopItemId);
            finalURL = finalURL.replace(":adId", ctx.messageId);
            console.log("fetch", finalURL);
            return fetch(finalURL, options)
                .then((response) => {
                    if (response.status === 404) {
                        this._service.send("not_available_received" as any);
                    }
                    return response;
                })
                .then((response) => {
                    if (response.status !== 200 && response.status !== 410) {
                        throw new Error("non-200 network status");
                    } else {
                        return response;
                    }
                })
                .then((res) => res.json())
                .then((res: any) => {
                    const status = res.status?.toLowerCase();
                    if (status === STATUS_GAME_OVER) {
                        this._service.send("game_over_received" as any);
                    }
                    return res;
                });
        };
    }

    private contemplate = (ctx: SolverContext): Promise<unknown> => {
        // console.log("contemplate on ctx:", ctx);
        console.log("score target:", ctx.scoreTarget, "current:", ctx.game.score);
        const healItem = this.findHealingPotion(ctx.shop);
        if (ctx.game.score >= ctx.scoreTarget) {
            this._solveRes(ctx.game);
            this._service.send("finished_solving" as any);
        } else if (
            ctx.game.lives <= CONTEMPLATE_BUY_HEAL_ITEM_THRESHOLD &&
            healItem != null &&
            healItem.cost <= ctx.game.gold
        ) {
            this._service.send({
                type: "decided_to_shop" as any,
                data: { id: healItem.id },
            });
        } else if (ctx.game.gold > CONTEMPLATE_BUY_ITEM_THRESHOLD) {
            this._service.send({
                type: "decided_to_shop" as any,
                data: {
                    //TO-DO: rework short circuit logic
                    id: ctx.shop[
                        Math.floor(Math.random() * (ctx.shop.length - 1)) + 1
                    ].id,
                },
            });
        } else {
            this._service.send({
                type: "decided_to_solve_message" as any,
                data: {
                    id: ctx.messages[0].adId,
                },
            });
        }
        // return Promise.resolve(1);
        return new Promise(() => {});
    };

    private findHealingPotion = (items: ShopItem[]): ShopItem | undefined => {
        let target = items.find((i) => i.id === "hpot");
        if (target == null) {
            target = items.find((i) => i.name.toLowerCase().indexOf("healing"));
        }
        return target;
    };
}
