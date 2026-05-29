/**
 * Shared test utilities for store tests.
 */
import { configureStore } from "@reduxjs/toolkit";
import { spinnerSlice } from "../spinnerSlice";
import { apiUrlSlice } from "../apiUrlSlice";
import { gameInstanceSlice } from "../gameInstanceSlice";
import { gamesSlice } from "../gamesSlice";
import type {
  GameStartResponse,
  Quest,
  QuestResponse,
  PurchaseResponse,
  Reputation,
  GameState,
} from "../../types/types";

// ---------------------------------------------------------------------------
// Store factory
// ---------------------------------------------------------------------------

export type TestPreloadedState = Parameters<
  typeof configureStore
>[0]["preloadedState"];

export const createTestStore = (preloadedState?: TestPreloadedState) =>
  configureStore({
    reducer: {
      spinner: spinnerSlice.reducer,
      gameInstance: gameInstanceSlice.reducer,
      games: gamesSlice.reducer,
      api: apiUrlSlice.reducer,
    },
    preloadedState,
  });

/** A store whose api.apiURL points to the mock server used in thunk tests. */
export const TEST_API_URL = "http://api.test";
export const createStoreWithApi = () =>
  createTestStore({ api: { apiURL: TEST_API_URL } });

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

export const mockGameState: GameState = {
  gold: 100,
  lives: 3,
  level: 2,
  score: 500,
  highScore: 1000,
  turn: 5,
};

export const mockGameStartResponse: GameStartResponse = {
  ...mockGameState,
  gameId: "game-abc",
};

export const mockQuests: Quest[] = [
  {
    adId: "q1",
    message: "Create an advertisement campaign",
    reward: 50,
    expiresIn: 3,
    encrypted: 0,
    probability: "Walk in the park",
  },
  {
    adId: "q2",
    message: "Create simple add",
    reward: 120,
    expiresIn: 1,
    encrypted: 0,
    probability: "Rather detrimental",
  },
];

export const mockQuestResponse: QuestResponse = {
  success: true,
  lives: 3,
  gold: 150,
  score: 550,
  highScore: 1000,
  turn: 6,
  message: "Well done!",
};

export const mockPurchaseResponse: PurchaseResponse = {
  shoppingSuccess: true,
  gold: 50,
  lives: 4,
  level: 3,
  turn: 7,
};

export const mockReputation: Reputation = {
  people: 75,
  state: 60,
  underworld: 45,
};

// ---------------------------------------------------------------------------
// fetch mock helpers
// ---------------------------------------------------------------------------

export const mockFetchOnce = (data: unknown, status = 200): void => {
  // status is required because thunks.ts now runs every response through
  // checkResponseNetworkStatus(), which throws unless response.status === 200.
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    status,
    json: () => Promise.resolve(data),
  });
};
