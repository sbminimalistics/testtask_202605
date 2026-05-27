import { configureStore } from '@reduxjs/toolkit';
import { gamesSlice } from '../gamesSlice';
import type { GameSummary } from '../gamesSlice';
import { startGame } from '../thunks';
import { mockGameStartResponse, mockGameState } from './testUtils';

const STORAGE_KEY = 'visual_adventure_games';

// Rebuild a fresh store (its initial state is always read from localStorage,
// so we clear storage between tests to prevent cross-test contamination)
const createStore = () =>
  configureStore({ reducer: { games: gamesSlice.reducer } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sampleSummary = (): GameSummary => ({
  gameId: 'game-xyz',
  state: mockGameState,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('gamesSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Initial state ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('is an empty array when localStorage has no saved games', () => {
      const store = createStore();
      expect(store.getState().games).toEqual([]);
    });
  });

  // ── Reducers ──────────────────────────────────────────────────────────────
  describe('addGame', () => {
    it('appends a game summary to the list', () => {
      const store = createStore();
      const summary = sampleSummary();
      store.dispatch(gamesSlice.actions.addGame(summary));
      expect(store.getState().games).toHaveLength(1);
      expect(store.getState().games[0]).toEqual(summary);
    });

    it('accumulates multiple games', () => {
      const store = createStore();
      store.dispatch(gamesSlice.actions.addGame({ gameId: 'g1', state: mockGameState }));
      store.dispatch(gamesSlice.actions.addGame({ gameId: 'g2', state: mockGameState }));
      expect(store.getState().games).toHaveLength(2);
    });

    it('persists the updated list to localStorage', () => {
      const store = createStore();
      const summary = sampleSummary();
      store.dispatch(gamesSlice.actions.addGame(summary));

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toEqual([summary]);
    });
  });

  // ── extraReducers ─────────────────────────────────────────────────────────
  describe('startGame.fulfilled', () => {
    it('appends a new GameSummary derived from the response', () => {
      const store = createStore();
      const action = startGame.fulfilled(mockGameStartResponse, 'reqId', undefined);
      store.dispatch(action);

      expect(store.getState().games).toHaveLength(1);
      expect(store.getState().games[0].gameId).toBe(mockGameStartResponse.gameId);
    });

    it('stores the GameState from the response', () => {
      const store = createStore();
      const action = startGame.fulfilled(mockGameStartResponse, 'reqId', undefined);
      store.dispatch(action);

      const saved = store.getState().games[0].state;
      expect(saved.gold).toBe(mockGameStartResponse.gold);
      expect(saved.lives).toBe(mockGameStartResponse.lives);
      expect(saved.level).toBe(mockGameStartResponse.level);
    });

    it('persists the updated games list to localStorage', () => {
      const store = createStore();
      const action = startGame.fulfilled(mockGameStartResponse, 'reqId', undefined);
      store.dispatch(action);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].gameId).toBe(mockGameStartResponse.gameId);
    });
  });

  // ── localStorage loading ───────────────────────────────────────────────────
  describe('loadFromLocalStorage', () => {
    it('pre-populates state with data found in localStorage at module init', () => {
      // Seed localStorage before the module is loaded
      const saved: GameSummary[] = [{ gameId: 'pre-loaded', state: mockGameState }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

      // Reset the module registry so gamesSlice re-evaluates loadFromLocalStorage
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { gamesSlice: freshSlice } = require('../gamesSlice');
      const freshStore = configureStore({ reducer: { games: freshSlice.reducer } });

      expect(freshStore.getState().games).toEqual(saved);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json');

      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { gamesSlice: freshSlice } = require('../gamesSlice');
      const freshStore = configureStore({ reducer: { games: freshSlice.reducer } });

      expect(freshStore.getState().games).toEqual([]);
      // loadFromLocalStorage catches the error silently
      expect(console.error).toHaveBeenCalled();
    });
  });
});
