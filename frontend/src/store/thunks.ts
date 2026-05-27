import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  GameStartResponse,
  ProductId,
  PurchaseResponse,
  Quest,
  QuestId,
  QuestResponse,
  Reputation,
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
  },
);

export const fetchQuests = createAsyncThunk(
  "fetchQuests",
  async (gameId: string, {getState}) => {
    const state = getState() as RootState;
    const apiUrl = state.api.apiURL;
    return (
      fetch(`${apiUrl}/${gameId}/messages`)
        .then((response) => response.json())
        .then((data) => data as Quest[])
    );
  },
);

export const acceptQuest = createAsyncThunk(
  "acceptQuest",
  async (questId: QuestId, { getState }) => {
    const state = getState() as RootState;
    const apiUrl = state.api.apiURL;
    return fetch(`${apiUrl}/${questId.gameId}/solve/${questId.adId}`, {
      method: "post",
    })
      .then((response) => response.json())
      .then((data) => data as QuestResponse);
  },
);

export const purchaseItem = createAsyncThunk(
  "purchaseItem",
  async (productId: ProductId, { getState }) => {
    const state = getState() as RootState;
    const apiUrl = state.api.apiURL;
    return fetch(`${apiUrl}/${productId.gameId}/shop/buy/${productId.itemId}`, {
      method: "post",
    })
      .then((response) => response.json())
      .then((data) => data as PurchaseResponse);
  },
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
  },
);
