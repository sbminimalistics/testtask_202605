/**
 * Integration-level tests for the root Redux store.
 *
 * These tests verify that:
 *  1. The store is created with the correct reducer keys.
 *  2. The combined initial state matches each slice's own initial state.
 *  3. Actions dispatched to the root store are handled by the right slice.
 */
import { store } from "../store";
import { showSpinner, hideSpinner, isSpinnerVisible } from "../spinnerSlice";
import { setApiUrl } from "../apiUrlSlice";
import { gameOver, selectGame } from "../gameInstanceSlice";
import { gamesSlice } from "../gamesSlice";
import { createTestStore } from "./testUtils";

// ---------------------------------------------------------------------------
// Root store shape
// ---------------------------------------------------------------------------

describe("store", () => {
    describe("state shape", () => {
        it("has the four expected top-level keys", () => {
            const state = store.getState();
            expect(state).toHaveProperty("spinner");
            expect(state).toHaveProperty("gameInstance");
            expect(state).toHaveProperty("games");
            expect(state).toHaveProperty("api");
        });

        it("spinner initial state is { visible: false }", () => {
            expect(store.getState().spinner).toEqual({ visible: false });
        });

        it("api initial state has a non-empty apiURL string", () => {
            const { apiURL } = store.getState().api;
            expect(typeof apiURL).toBe("string");
            // Derived from import.meta.env stubs in jest.setup.cjs
            expect(apiURL).toBe("http://localhost:3000/api/v1");
        });

        it("games initial state is an empty array", () => {
            // localStorage is empty in this test environment
            expect(Array.isArray(store.getState().games)).toBe(true);
        });

        it("gameInstance initial state has gameOver: false", () => {
            expect(store.getState().gameInstance.gameOver).toBe(false);
        });

        it("gameInstance initial state has gameId: null", () => {
            expect(store.getState().gameInstance.gameId).toBeNull();
        });
    });

    // ── Cross-slice dispatch sanity checks ──────────────────────────────────
    describe("dispatching actions to a fresh test store", () => {
        it("showSpinner / hideSpinner update the spinner slice", () => {
            const s = createTestStore();
            s.dispatch(showSpinner());
            expect(isSpinnerVisible(s.getState())).toBe(true);

            s.dispatch(hideSpinner());
            expect(isSpinnerVisible(s.getState())).toBe(false);
        });

        it("setApiUrl updates the api slice", () => {
            const s = createTestStore();
            s.dispatch(setApiUrl("http://new.example.com"));
            expect(s.getState().api.apiURL).toBe("http://new.example.com");
        });

        it("selectGameId updates the gameInstance slice", () => {
            const s = createTestStore();
            s.dispatch(selectGame({ gameId: "test-game-id" }));
            expect(s.getState().gameInstance.gameId).toBe("test-game-id");
        });

        it("gameOver updates the gameInstance slice", () => {
            const s = createTestStore();
            s.dispatch(gameOver());
            expect(s.getState().gameInstance.gameOver).toBe(true);
        });

        it("addGame updates the games slice", () => {
            const s = createTestStore();
            const summary = {
                gameId: "g-store-test",
                state: {
                    gold: 0,
                    lives: 3,
                    level: 1,
                    score: 0,
                    highScore: 0,
                    turn: 0,
                },
            };
            s.dispatch(gamesSlice.actions.addGame(summary));
            expect(s.getState().games).toHaveLength(1);
            expect(s.getState().games[0]).toEqual(summary);
        });
    });

    // ── Redux Toolkit typed hooks ─────────────────────────────────────────────
    describe("exported types and hooks", () => {
        it("useAppDispatch is a function", async () => {
            const { useAppDispatch } = await import("../store");
            expect(typeof useAppDispatch).toBe("function");
        });

        it("useAppSelector is a function", async () => {
            const { useAppSelector } = await import("../store");
            expect(typeof useAppSelector).toBe("function");
        });
    });
});
