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
// import { GameStatus, updateGameStatus } from "./gamesSlice";

export enum NetworkStatusErrors {
    GAME_OVER = "game_over",
    NOT_FOUND = "not_found",
    UNKNOWN = "unknown",
}

function checkResponseNetworkStatus(response: Response) {
    if (response.status === 200) {
        return response;
    } else if (response.status === 410) {
        throw new Error(NetworkStatusErrors.GAME_OVER);
    } else if (response.status === 404) {
        throw new Error(NetworkStatusErrors.NOT_FOUND);
    } else {
        // 429 (too many requests), ... status codes fall in here
        throw new Error(NetworkStatusErrors.UNKNOWN);
    }
}

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
            .then(checkResponseNetworkStatus)
            .then((response) => response.json())
            .then((data) => data as Quest[])
            // .catch((e) => {
            //     console.error("fetchQuests error:", e.message);
            //     // return [];
            //     if (e.message === NetworkStatusErrors.GAME_OVER) {
            //         // dispatch(
            //         //     updateGameStatus({
            //         //         gameId: data.gameId,
            //         //         gameStatus: GameStatus.GAME_OVER,
            //         //     })
            //         // );
            //         throw new Error("not found");
            //     } else {
            //         // 404, 429, ... status codes fall in here
            //         // dispatch(
            //         //     updateGameStatus({
            //         //         gameId: data.gameId,
            //         //         gameStatus: GameStatus.NOT_AVAILABLE,
            //         //     })
            //         // );
            //         throw new Error("not found");
            //     }
            // });
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
            .then(checkResponseNetworkStatus)
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
            .then(checkResponseNetworkStatus)
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
            .then(checkResponseNetworkStatus)
            .then((response) => response.json())
            .then((data) => data as Reputation);
    }
);
