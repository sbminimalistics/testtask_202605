import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "./../../env/.env.development" });

import * as readline from "node:readline/promises";
import { WebSocketServer } from "ws";
import {
    action,
    createMachine,
    interpret,
    invoke,
    reduce,
    Service,
    state,
    transition,
} from "robot3";
import Solver, { Game, SolveResults } from "./solver/Solver";

const REATTEMPT_SOLVE_DELAY_MS = 3000;

const wss = new WebSocketServer({ port: 8888 });

wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });

    ws.send("something");
});

const solver = new Solver(
    `${process.env.VITE_API_HOST}${process.env.VITE_API_PATH}`
);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const startSolve = action((ctx, event) => {
    console.log(`startSolve: ${event}`);
    solver.solve({ game: ctx.game, scoreTarget: ctx.scoreTarget });
    return ctx;
});

const serviceMachine = createMachine({
    ask_start: invoke(
        askInput(
            `1.create a new game 2.solve existing game [1/2]: `,
            (response) => {
                // console.log(`your response: ${response}!`);
                switch (response) {
                    case "1":
                        service.send({
                            type: "new_game" as any,
                            data: { scenario: Number(response) },
                        });
                        break;
                    case "2":
                        service.send({
                            type: "existing_game" as any,
                            data: { scenario: Number(response) },
                        });
                        break;
                    default:
                        service.send({
                            type: "re_ask_start" as any,
                            data: { scenario: response },
                        });
                }
            }
        ),
        transition(
            "new_game" as const,
            "ask_score_target",
            reduce((ctx: object, ev: any) => ({
                ...ctx,
                scenario: ev.data.scenario,
            }))
        ),
        transition(
            "existing_game" as const,
            "ask_game_id",
            reduce((ctx: object, ev: any) => ({
                ...ctx,
                scenario: ev.data.scenario,
            }))
        ),
        transition("re_ask_start" as const, "ask_start")
    ),
    ask_game_id: invoke(
        askInput(`game id: `, (response) => {
            if (response.length === 0) {
                service.send("re_asked_game_id" as any);
            } else {
                service.send({
                    type: "asked_score_target" as any,
                    data: { game: { gameId: response } },
                });
            }
        }),
        transition(
            "asked_score_target" as const,
            "ask_score_target",
            reduce((ctx: object, ev: any) => ({
                ...ctx,
                game: ev.data.game,
            }))
        ),
        transition("re_asked_game_id" as const, "ask_game_id")
    ),
    ask_score_target: invoke(
        askInput(`score target: `, (response) => {
            try {
                const target = Number(response);
                console.log("score target number:", target);
                if (isNaN(target)) {
                    service.send({
                        type: "re_ask_score_target" as any,
                        data: { input: -1 },
                    });
                } else {
                    service.send({
                        type: "process_inputs" as any,
                        data: { input: target },
                    });
                }
            } catch (err) {
                console.log(err);
            }
        }),
        transition("re_ask_score_target" as const, "ask_score_target"),
        transition(
            "process_inputs" as const,
            "process_inputs",
            reduce((ctx: object, ev: any) => ({
                ...ctx,
                scoreTarget: ev.data.input,
            }))
        )
    ),
    process_inputs: invoke(
        (ctx: any, event: any): Promise<void> => {
            console.log("process_inputs action ctx:", ctx, "event:", event);
            if (ctx.scenario === 1 || ctx.scenario === 2) {
                service.send(
                    (ctx.scenario === 1 ? "create_game" : "solve") as any
                );
            } else {
                service.send("re_ask_start" as any);
            }
            return Promise.resolve();
        },
        transition(
            "re_ask_start" as const,
            "ask_start",
            reduce((ctx: object, ev: any) => ({}))
        ),
        transition("create_game" as const, "create_game"),
        transition("solve" as const, "solve", startSolve)
    ),
    create_game: invoke(
        createGame,
        transition(
            "solve" as const,
            "solve",
            reduce((ctx: object, ev: any) => ({ ...ctx, game: ev.data.game }))
        ),
        transition(
            "re_ask_start" as const,
            "ask_start",
            reduce((ctx: object, ev: any) => ({}))
        )
    ),
    solve: invoke(
        solveGame,
        transition(
            "done" as const,
            "evaluate_solve_results",
            reduce((ctx: object, evt: any) => {
                console.log(
                    "solve: transition done|evaluate_solve_results",
                    evt.data
                );
                return {
                    ...ctx,
                    game: evt.data.game,
                };
            })
        ),
        transition("error" as const, "evaluate_solve_results")
    ),
    solve_cancelled: invoke(
        () =>
            new Promise((res, rej) => {
                console.log(
                    `reattempting game solve in ${
                        REATTEMPT_SOLVE_DELAY_MS / 1000
                    }s...`
                );
                setTimeout(res, REATTEMPT_SOLVE_DELAY_MS);
            }),
        transition("done" as const, "solve")
    ),
    evaluate_solve_results: invoke(
        evaluateSolveResults,
        transition("further_solving_required" as const, "solve"),
        transition(
            "solve_ended" as const,
            "ask_start",
            action((ctx, event) => {
                console.log("Transitioning with:", event);
                return ctx;
            })
        )
        // transition("done" as const, "results")
    ),
    // results: state(transition("next_step" as const, "ask_start")),
});

const service: Service<typeof serviceMachine> = interpret(
    serviceMachine,
    () => {
        // console.log(
        //     "State changed to:",
        //     service.machine.current,
        //     "context:",
        //     service.context
        // );
    }
);

function askInput(out: string, fulfilledHandler: (input: string) => void) {
    return async function () {
        rl.question(out).then(fulfilledHandler);
    };
}

function createGame() {
    console.log("createGame");
    // return Promise.resolve("dummy_gameID");
    if (
        process.env.VITE_API_HOST == null ||
        process.env.VITE_API_PATH == null
    ) {
        throw new Error(
            "VITE_API_HOST and/or VITE_API_PATH is not set up, check readme in the project root"
        );
    }
    return fetch(
        `${process.env.VITE_API_HOST}${process.env.VITE_API_PATH}/game/start`,
        {
            method: "post",
        }
    )
        .then((res) => res.json())
        .then((res) => {
            service.send({ type: "solve" as any, data: { game: res } });
            return 0;
        })
        .catch((err) => {
            console.log("createGame fetch failed with err:", err);
            service.send("re_ask_start" as any);
            return 1;
        });
}

function solveGame(): Promise<Game> {
    console.log("solveGame ctx:", service.context);
    return solver.solve({
        game: service.context.game,
        scoreTarget: service.context.scoreTarget,
    });
    // return async function (input) {
    //     console.log("solveGame", input);
    // };
}

function evaluateSolveResults() {
    // console.log("evaluateSolveResults ctx:", service.context);
    const { gameId, lives, gold, level, score, highScore, turn } =
        service.context.game;
    if (lives > 0 && score < service.context.scoreTarget) {
        console.log(
            "evaluateSolveResults score:",
            score,
            "target:",
            service.context.scoreTarget
        );
        service.send("further_solving_required");
    } else {
        service.send("solve_ended");
    }
    return Promise.resolve(1);
}
