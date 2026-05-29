import { createSlice } from "@reduxjs/toolkit";
import {
    Product,
    PurchaseResponse,
    Quest,
    QuestResponse,
} from "../types/types";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/localStorage";
import { acceptQuest, purchaseItem } from "./thunks";

const STORAGE_KEY = "visual_adventure_log";

export enum LogEntryType {
    QUEST = "quest",
    PRODUCT = "product",
}

export type LogEntry =
    | {
          type: LogEntryType.QUEST;
          gameId: string;
          requestId: string;
          quest: Quest;
          response?: QuestResponse;
      }
    | {
          type: LogEntryType.PRODUCT;
          gameId: string;
          requestId: string;
          product: Product;
          response?: PurchaseResponse;
      };

const initial: LogEntry[] = loadFromLocalStorage(STORAGE_KEY);

export const logSlice = createSlice({
    name: "logSlice",
    initialState: initial,
    reducers: {
        addEntry: (state, action) => {
            state.push(action.payload);
            saveToLocalStorage(STORAGE_KEY, state);
        },
        removeEntry: (state, action) => {
            const index = state.findIndex(
                (val) => val.gameId === action.payload
            );
            state.splice(index, 1);
            saveToLocalStorage(STORAGE_KEY, state);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            acceptQuest.pending,
            (state, action: ReturnType<typeof acceptQuest.pending>) => {
                const { quest, gameId } = action.meta.arg;
                state.unshift({
                    type: LogEntryType.QUEST,
                    gameId,
                    requestId: action.meta.requestId,
                    quest: quest,
                });
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            acceptQuest.fulfilled,
            (state, action: ReturnType<typeof acceptQuest.fulfilled>) => {
                const entry = state.find(
                    (item) => item.requestId === action.meta.requestId
                );
                if (entry != null) {
                    entry.response = action.payload;
                }
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            acceptQuest.rejected,
            (state, action: ReturnType<typeof acceptQuest.rejected>) => {
                const entry = state.find(
                    (item) => item.requestId === action.meta.requestId
                );
                if (entry != null) {
                    entry.response = {
                        message: action.error.message ?? "error",
                        success: false,
                        lives: 0,
                        gold: 0,
                        score: 0,
                        highScore: 0,
                        turn: 0,
                    };
                }
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            purchaseItem.pending,
            (state, action: ReturnType<typeof purchaseItem.pending>) => {
                const { product, gameId } = action.meta.arg;
                state.unshift({
                    type: LogEntryType.PRODUCT,
                    gameId,
                    requestId: action.meta.requestId,
                    product: product,
                });
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            purchaseItem.fulfilled,
            (state, action: ReturnType<typeof purchaseItem.fulfilled>) => {
                const entry = state.find(
                    (item) => item.requestId === action.meta.requestId
                );
                if (entry != null) {
                    entry.response = action.payload;
                }
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
        builder.addCase(
            purchaseItem.rejected,
            (state, action: ReturnType<typeof purchaseItem.rejected>) => {
                const entry = state.find(
                    (item) => item.requestId === action.meta.requestId
                );
                if (entry != null) {
                    entry.response = {
                        message: action.error.message ?? "error",
                        success: false,
                        lives: 0,
                        gold: 0,
                        score: 0,
                        highScore: 0,
                        turn: 0,
                    };
                }
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
    },
});

export const { addEntry, removeEntry } = logSlice.actions;
