import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { startGame } from "./thunks";
import { GameStartResponse, GameState } from "../types/types";

const STORAGE_KEY = "visual_adventure_games";

// interface GamesState {
//     games: GameSummary[];
// }

export interface GameSummary {
    gameId: string;
    state: GameState;
}

const loadFromLocalStorage = (): GameSummary[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Failed to load games from localStorage:", error);
    }
    return [];
};

const saveToLocalStorage = (games: GameSummary[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
        console.error("Failed to save games to localStorage:", error);
    }
};

const initial: GameSummary[] = loadFromLocalStorage();

export const gamesSlice = createSlice({
    name: "gamesSlice",
    initialState: initial,
    reducers: {
        addGame: (state, action) => {
            state.push(action.payload);
            saveToLocalStorage(state);
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
                saveToLocalStorage(state);
            }
        );
    },
});
