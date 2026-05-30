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

export interface Game {
    gameId: string;
    lives: number;
    gold: number;
    level: number;
    score: number;
    highScore: number;
    turn: number;
}

export interface SolveResults {
    game: Game;
}

export interface ShopItem {
    id: string;
    name: string;
    cost: number;
}

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
        this._machine = createMachine({
            idle: state(
                transition(
                    "solve",
                    "loading_messages",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        ...ev.data,
                    }))
                )
            ),
            loading_messages: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/messages`),
                transition(
                    "done",
                    "loading_shop",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        messages: ev.data,
                    }))
                ),
                transition(
                    "error",
                    "failed",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        messages: [],
                    }))
                )
            ),
            loading_shop: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/shop`),
                transition(
                    "done",
                    "contemplating",
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
                )
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
                )
            ),
            purchasing_item: invoke(
                this.fetchEndpoint(
                    `${this._api}/:gameId/shop/buy/:itemId`,
                    "POST"
                ),
                transition(
                    "done",
                    "contemplating",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        game: { ...ctx.game, ...ev.data },
                    }))
                )
            ),
            solving_message: invoke(
                this.fetchEndpoint(`${this._api}/:gameId/solve/:adId`, "POST"),
                transition(
                    "done",
                    "loading_messages",
                    reduce((ctx: object, ev: any) => ({
                        ...ctx,
                        game: { ...ctx.game, ...ev.data },
                    }))
                )
            ),
            solving: state(transition("solved", "solved")),
            solved: state(transition("turned_idle", "idle")),
            failed: invoke(
                (ctx) => {
                    this._solveRej(new Error(ctx.error));
                    this._service.send("turned_idle");
                    return Promise.resolve();
                },
                transition(
                    "turned_idle",
                    "idle",
                    action((ctx) => {
                        console.log("failed > immediate > idle:", ctx);
                        this._solveRej(ctx.error);
                        return ctx;
                    })
                )
            ),
        });
        this._service = interpret(this._machine, () => {
            console.log(
                "Solver state changed to:",
                this._service.machine.current
            );
        });
    }

    public solve(props: { game: Game; scoreTarget?: number }): Promise<any> {
        if (["idle", "solved"].includes(this._machine.current) !== true) {
            return Promise.reject("solver is busy");
        }
        console.log("Solver.solve props:", props);
        // this._game = props.game;
        // this._game.score += 1;
        // this._scoreTarget = props.scoreTarget;
        this._service.send({
            type: "solve",
            data: { game: props.game, scoreTarget: props.scoreTarget },
        });
        // return Promise.resolve({ game: this._game });
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
            console.log("fetchEndpoint invoked", finalURL);
            return fetch(finalURL, options)
                .then((response) => {
                    // console.log("fetch response:", response);
                    if (response.status !== 200) {
                        console.log(
                            "fetchEndpoint failed with network status:",
                            response.status
                        );
                        throw new Error("non-200 network status");
                    } else {
                        return response;
                    }
                })
                .then((res) => res.json());
        };
    }

    private contemplate(ctx): Promise<unknown> {
        // console.log("contemplate on ctx:", ctx);
        console.log("contemplate on ctx:");
        const healItem = this.findHealingPotion(ctx.shop);
        console.log("contemplate healItem:", healItem);
        if (
            ctx.game.lives < 2 &&
            healItem != null &&
            healItem.cost <= ctx.game.gold
        ) {
            console.log("debug pos0");
            this._service.send({
                type: "decided_to_shop" as any,
                data: { id: healItem.id },
            });
        } else if (ctx.game.gold > 400) {
            console.log("debug pos1");
            this._service.send({
                type: "decided_to_shop" as any,
                data: {
                    //TO-DO: rework short circuit logic
                    id: ctx.shop[
                        Math.floor(Math.random() * ctx.shop.length) + 1
                    ].id,
                },
            });
        } else {
            console.log("debug pos2");
            this._service.send({
                type: "decided_to_solve_message" as any,
                data: {
                    //TO-DO: rework short circuit logic
                    id: ctx.messages[
                        Math.floor(Math.random() * (ctx.messages.length + 1))
                    ].adId,
                },
            });
        }
        return Promise.resolve(1);
    }

    private findHealingPotion(items: ShopItem[]): ShopItem | undefined {
        let target = items.find((i) => i.id === "hpot");
        if (target == null) {
            target = items.find((i) => i.name.toLowerCase().indexOf("healing"));
        }
        return target;
    }
}
