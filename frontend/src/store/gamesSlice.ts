import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchQuests, startGame } from "./thunks";
import { GameStartResponse, GameState } from "../types/types";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";

const STORAGE_KEY = "visual_adventure_games";

export enum GameStatus {
    RUNNING = "running",
    REQUIRES_UPDATE = "requires update",
    CHECKING_STATUS = "checking status...",
    GAME_OVER = "game over",
    NOT_AVAILABLE = "not available",
}

export interface GameSummary {
    gameId: string;
    state: GameState;
    status: GameStatus;
}

const initial: GameSummary[] = loadFromLocalStorage(STORAGE_KEY);

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
                // console.log(
                //     "gamesSlice fetchQuests.fullfilled action | game found:",
                //     game,
                //     "action.payload:",
                //     action.payload
                // );
                if (game != null) {
                    game.status =
                        action.payload == null
                            ? GameStatus.NOT_AVAILABLE
                            : GameStatus.RUNNING;
                }
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
    },
});

export const { addGame, removeGame } = gamesSlice.actions;
