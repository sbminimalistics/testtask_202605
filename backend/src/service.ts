import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "./../../env/.env.development" });

import * as readline from "node:readline/promises";
import { WebSocketServer } from "ws";
import {
    action,
    createMachine,
    immediate,
    interpret,
    invoke,
    reduce,
    state,
    transition,
} from "robot3";
import Solver from "./solver/Solver";
import { Game, ServiceContext } from "./solver/types";

const REATTEMPT_SOLVE_DELAY_MS = 3000;
const SOLVE_DEFAULT_ITERATIONS = 10;
const SOLVE_MIN_ITERIM_SCORE_TARGET_STEP = 100;
const SOLVE_MAX_ITERIM_SCORE_TARGET_STEP = 1000;

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

const startSolve = action((ctx: ServiceContext, event) => {
    console.log(`startSolve: ${event}`);
    solver.solve({ game: ctx.game as Game, scoreTarget: ctx.scoreTarget });
    return ctx;
});

const resetStateReducer = reduce((ctx: ServiceContext) => ({
    ...ctx,
    scoreTargetSteps: [],
    scenario: -1,
    scoreTarget: -1,
    interimScoreTarget: -1,
    game: {},
}));

const serviceMachine = createMachine(
    {
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
            transition("re_ask_start" as const, "ask_start", resetStateReducer)
        ),
        ask_game_id: invoke(
            askInput(`game id: `, (response) => {
                if (response.length === 0) {
                    service.send("re_asked_game_id" as any);
                } else {
                    service.send({
                        type: "asked_score_target" as any,
                        data: { game: { gameId: response, score: -1 } },
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
            transition("re_ask_start" as const, "ask_start", resetStateReducer),
            transition("create_game" as const, "create_game"),
            transition(
                "solve" as const,
                "generate_score_target_steps",
                startSolve
            )
        ),
        create_game: invoke(
            createGame,
            transition(
                "solve" as const,
                "generate_score_target_steps",
                reduce((ctx: object, ev: any) => ({
                    ...ctx,
                    game: ev.data.game,
                }))
            ),
            transition("re_ask_start" as const, "ask_start", resetStateReducer)
        ),
        generate_score_target_steps: state(
            immediate(
                "solve",
                reduce((ctx: ServiceContext) => {
                    const steps: number[] = [];
                    let acc = ctx.game.score ?? 0;
                    const diff = ctx.scoreTarget - acc;
                    const scoreStep = Math.ceil(
                        Math.max(
                            SOLVE_MIN_ITERIM_SCORE_TARGET_STEP,
                            Math.min(
                                diff / SOLVE_DEFAULT_ITERATIONS,
                                SOLVE_MAX_ITERIM_SCORE_TARGET_STEP
                            )
                        )
                    );

                    while (acc < ctx.scoreTarget) {
                        acc += scoreStep;
                        if (acc > ctx.scoreTarget) {
                            acc = ctx.scoreTarget;
                        }
                        steps.push(acc);
                    }
                    const firstStep = steps.shift();
                    const modCtx = {
                        ...ctx,
                        scoreTargetSteps: steps,
                        interimScoreTarget: firstStep ?? ctx.scoreTarget,
                    };
                    console.log(
                        "generate_score_target_steps immedtiate modCtx:",
                        modCtx
                    );
                    return modCtx;
                })
            )
        ),
        solve: invoke(
            solveGame,
            transition(
                "done" as const,
                "evaluate_solve_results",
                reduce((ctx: object, evt: any) => {
                    return {
                        ...ctx,
                        game: evt.data,
                    };
                })
            ),
            transition(
                "error" as const,
                "evaluate_solve_results",
                reduce((ctx: any, evt: any) => {
                    console.log(
                        "solve: transition error|evaluate_solve_results",
                        evt.data
                    );
                    return {
                        ...ctx,
                        game: { ...ctx.game, gameOver: true },
                    };
                })
            )
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
            transition(
                "further_solving_required" as const,
                "solve",
                reduce((ctx: ServiceContext) => {
                    const nextStep =
                        ctx.scoreTargetSteps.shift() ?? ctx.scoreTarget;
                    const modCtx = { ...ctx, interimScoreTarget: nextStep };
                    return modCtx;
                })
            ),
            transition(
                "solve_ended" as const,
                "ask_start",
                action((ctx: ServiceContext) => {
                    console.log("solved!");
                    console.log(ctx.game);
                    return ctx;
                }),
                resetStateReducer
            ),
            transition(
                "not_available_received" as const,
                "ask_start",
                action((ctx: ServiceContext) => {
                    console.log("game not available!");
                    console.log(ctx.game);
                    return ctx;
                }),
                resetStateReducer
            ),
            transition(
                "game_over_received" as const,
                "ask_start",
                action((ctx: ServiceContext) => {
                    console.log("game over!");
                    console.log(ctx.game);
                    return ctx;
                }),
                resetStateReducer
            )
            // transition("done" as const, "results")
        ),
        // results: state(transition("next_step" as const, "ask_start")),
    },
    (): ServiceContext => ({
        scenario: -1,
        scoreTarget: -1,
        interimScoreTarget: -1,
        game: {},
        scoreTargetSteps: [],
    })
);

const service = interpret(serviceMachine, () => {
    // console.log(
    //     "State changed to:",
    //     service.machine.current,
    //     "context:",
    //     service.context
    // );
}) as unknown as {
    send: (event: string | { type: string; [key: string]: unknown }) => void;
    machine: typeof serviceMachine;
    context: ServiceContext;
};

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
            service.send({
                type: "solve" as any,
                data: {
                    game: {
                        gameOver: false,
                        available: true,
                        ...(res as object),
                    },
                },
            });
            return 0;
        })
        .catch((err) => {
            console.log("createGame fetch failed with err:", err);
            service.send("re_ask_start" as any);
            return 1;
        });
}

function solveGame(ctx: ServiceContext): Promise<Game> {
    // console.log("solveGame ctx:", service.context);
    console.log("----------------------------");
    console.log(
        "score target:",
        service.context.scoreTarget,
        "next interim target:",
        service.context.interimScoreTarget,
        "current:",
        service.context.game.score
    );
    console.log("----------------------------");
    return solver.solve({
        game: ctx.game as Game,
        scoreTarget: ctx.interimScoreTarget,
    });
}

function evaluateSolveResults(ctx: ServiceContext): Promise<any> {
    // console.log("evaluateSolveResults ctx:", service.context);
    const { lives, score, gameOver, available } = service.context.game;
    if (available === false) {
        service.send("not_available_received");
    } else if (gameOver === true) {
        service.send("game_over_received");
    } else if (
        lives != null &&
        score != null &&
        lives > 0 &&
        score < service.context.scoreTarget
    ) {
        service.send("further_solving_required");
    } else {
        service.send("solve_ended");
    }
    return Promise.resolve(1);
}
