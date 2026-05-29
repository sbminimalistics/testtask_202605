import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit";
import {
    acceptQuest,
    fetchQuests,
    NetworkStatusErrors,
    purchaseItem,
    startGame,
} from "./thunks";
import { GameStartResponse, GameState } from "../types/types";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";

const STORAGE_KEY = "visual_adventure_games";

export enum GameStatus {
    RUNNING = "running",
    CHECKING_STATUS = "checking status...",
    GAME_OVER = "game over",
    NOT_AVAILABLE = "not available",
    UNKNOWN = "unknown",
}

export interface GameSummary {
    gameId: string;
    state: GameState;
    status: GameStatus;
}

const initial: GameSummary[] = loadFromLocalStorage(STORAGE_KEY);

function updateGameStatusBasedOnErrorMsg(
    game: Draft<GameSummary> | undefined,
    msg: string | undefined
) {
    if (game != null) {
        switch (msg) {
            case NetworkStatusErrors.GAME_OVER:
                game.status = GameStatus.GAME_OVER;
                break;
            case NetworkStatusErrors.NOT_FOUND:
                game.status = GameStatus.NOT_AVAILABLE;
                break;
            default:
                game.status = GameStatus.UNKNOWN;
        }
    }
}

export const gamesSlice = createSlice({
    name: "gamesSlice",
    initialState: initial,
    reducers: {
        addGame: (state, action) => {
            state.push(action.payload);
            saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
        },
        removeGame: (state, action) => {
            const index = state.findIndex(
                (val) => val.gameId === action.payload
            );
            state.splice(index, 1);
            saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
        },
        updateGameStatus: (state, action) => {
            if (action.payload.gameId != null) {
                const index = state.findIndex(
                    (val) => (val.gameId = action.payload.gameId)
                );
                if (index > -1) {
                    state[index] = action.payload.status;
                }
            } else {
                state.forEach((val) => (val.status = action.payload.status));
            }
            saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            startGame.fulfilled,
            (state, action: PayloadAction<GameStartResponse>) => {
                state.push({
                    gameId: action.payload.gameId,
                    state: action.payload,
                    status: GameStatus.RUNNING,
                });
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            fetchQuests.fulfilled,
            (state, action: ReturnType<typeof fetchQuests.fulfilled>) => {
                const gameId = action.meta.arg.gameId;
                const game = state.find((g) => g.gameId === gameId);
                if (game != null) {
                    game.status =
                        action.payload == null
                            ? GameStatus.NOT_AVAILABLE
                            : GameStatus.RUNNING;
                }
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            fetchQuests.rejected,
            (state, action: ReturnType<typeof fetchQuests.rejected>) => {
                const gameId = action.meta.arg.gameId;
                const game = state.find((g) => g.gameId === gameId);
                updateGameStatusBasedOnErrorMsg(game, action.error.message);
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            acceptQuest.fulfilled,
            (state, action: ReturnType<typeof acceptQuest.fulfilled>) => {
                const gameId = action.meta.arg.gameId;
                const game = state.find((g) => g.gameId === gameId);
                if (game != null) {
                    const {
                        success: _success,
                        message: _message,
                        ...rest
                    } = action.payload;
                    game.state = { ...game.state, ...rest };
                }
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            acceptQuest.rejected,
            (state, action: ReturnType<typeof acceptQuest.rejected>) => {
                const gameId = action.meta.arg.gameId;
                const game = state.find((g) => g.gameId === gameId);
                updateGameStatusBasedOnErrorMsg(game, action.error.message);
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            purchaseItem.fulfilled,
            (state, action: ReturnType<typeof purchaseItem.fulfilled>) => {
                const gameId = action.meta.arg.gameId;
                const game = state.find((g) => g.gameId === gameId);
                if (game != null) {
                    const { shoppingSuccess: _success, ...rest } =
                        action.payload;
                    game.state = { ...game.state, ...rest };
                }
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
    },
});

export const { addGame, removeGame, updateGameStatus } = gamesSlice.actions;
