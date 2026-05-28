import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    GameStartResponse,
    Purchase,
    PurchaseResponse,
    Quest,
    QuestSolveData,
    QuestResponse,
    Reputation,
    QuestsFetchData,
} from "../types/types";
import { RootState } from "./store";

export const startGame = createAsyncThunk(
    "startGame",
    async (_, { getState }) => {
        const state = getState() as RootState;
        const apiUrl = state.api.apiURL;
        return fetch(`${apiUrl}/game/start`, { method: "post" })
            .then((response) => response.json())
            .then((data) => data as GameStartResponse);
    }
);

export const fetchQuests = createAsyncThunk(
    "fetchQuests",
    async (data: QuestsFetchData, { getState }) => {
        const state = getState() as RootState;
        const apiUrl = state.api.apiURL;
        return fetch(`${apiUrl}/${data.gameId}/messages`)
            .then((response) => {
                if (response.status === 404 || response.status === 410) {
                    throw new Error("not found");
                }
                return response;
            })
            .then((response) => response.json())
            .then((data) => data as Quest[])
            .catch((e) => {
                console.error("fetchQuests error:", e.message);
                return [];
            });
    }
);

export const acceptQuest = createAsyncThunk(
    "acceptQuest",
    async (data: QuestSolveData, { getState }) => {
        const state = getState() as RootState;
        const apiUrl = state.api.apiURL;
        return fetch(`${apiUrl}/${data.gameId}/solve/${data.adId}`, {
            method: "post",
        })
            .then((response) => response.json())
            .then((data) => data as QuestResponse);
    }
);

export const purchaseItem = createAsyncThunk(
    "purchaseItem",
    async (purchase: Purchase, { getState }) => {
        const state = getState() as RootState;
        const apiUrl = state.api.apiURL;
        return fetch(
            `${apiUrl}/${purchase.gameId}/shop/buy/${purchase.itemId}`,
            {
                method: "post",
            }
        )
            .then((response) => response.json())
            .then((data) => data as PurchaseResponse);
    }
);

export const investigateReputation = createAsyncThunk(
    "investigateReputation",
    async (gameId: string, { getState }) => {
        const state = getState() as RootState;
        const apiUrl = state.api.apiURL;
        return fetch(`${apiUrl}/${gameId}/investigate/reputation`, {
            method: "post",
        })
            .then((response) => response.json())
            .then((data) => data as Reputation);
    }
);
