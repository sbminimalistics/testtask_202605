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

export type LogEntry =
    | {
          gameId: string;
          requestId: string;
          quest: Quest;
          response?: QuestResponse;
      }
    | {
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
                console.log(action.type, action);
                const { quest, gameId } = action.meta.arg;
                state.unshift({
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
                console.log(action.type, action, action.meta);
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
            purchaseItem.pending,
            (state, action: ReturnType<typeof purchaseItem.pending>) => {
                console.log(action.type, action);
                const { product, gameId } = action.meta.arg;
                state.unshift({
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
                console.log(action.type, action, action.meta);
                const entry = state.find(
                    (item) => item.requestId === action.meta.requestId
                );
                if (entry != null) {
                    entry.response = action.payload;
                }
                saveToLocalStorage(STORAGE_KEY, state);
            }
        );
    },
});

export const { addEntry, removeEntry } = logSlice.actions;
