import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { startGame } from "./thunks";
import { GameStartResponse, GameState } from "../types/types";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";

const STORAGE_KEY = "visual_adventure_games";

export interface GameSummary {
    gameId: string;
    state: GameState;
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
            const index = state.findIndex(val => val.gameId === action.payload)
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
                });
                saveToLocalStorage<GameSummary>(STORAGE_KEY, state);
            }
        );
    },
});

export const { addGame, removeGame } = gamesSlice.actions;
