import { gameInstanceSlice, gameOver, selectGame } from "../gameInstanceSlice";
import {
    startGame,
    acceptQuest,
    fetchQuests,
    purchaseItem,
    investigateReputation,
} from "../thunks";
import type { GameInstance } from "../../types/types";
import {
    mockGameStartResponse,
    mockQuests,
    mockQuestResponse,
    mockPurchaseResponse,
    mockReputation,
} from "./testUtils";

const { reducer } = gameInstanceSlice;

// ---------------------------------------------------------------------------
// Expected initial state
// ---------------------------------------------------------------------------

const expectedInitial: GameInstance = {
    gameId: null,
    gameState: { gold: 0, highScore: 0, level: 0, lives: 0, score: 0, turn: 0 },
    quests: [],
    reputation: { people: 0, underworld: 0, state: 0 },
    gameOver: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("gameInstanceSlice", () => {
    // ── Initial state ──────────────────────────────────────────────────────────
    describe("initial state", () => {
        it("matches the expected empty game instance", () => {
            expect(reducer(undefined, { type: "@@INIT" })).toEqual(
                expectedInitial
            );
        });
    });

    // ── Sync reducers ─────────────────────────────────────────────────────────
    describe("gameOver reducer", () => {
        it("sets gameOver to true", () => {
            const state = reducer(undefined, gameOver());
            expect(state.gameOver).toBe(true);
        });

        it("does not mutate other fields", () => {
            const state = reducer(undefined, gameOver());
            expect(state.gameId).toBeNull();
            expect(state.gameState).toEqual(expectedInitial.gameState);
        });
    });

    describe("selectGameId reducer", () => {
        it("stores the provided gameId", () => {
            const state = reducer(
                undefined,
                selectGame({ gameId: "my-game-123" })
            );
            expect(state.gameId).toBe("my-game-123");
        });

        it("can update the gameId to a new value", () => {
            const after1 = reducer(undefined, selectGame({ gameId: "game-1" }));
            const after2 = reducer(after1, selectGame({ gameId: "game-2" }));
            expect(after2.gameId).toBe("game-2");
        });

        it("can set gameId to null", () => {
            const after1 = reducer(undefined, selectGame({ gameId: "game-1" }));
            const after2 = reducer(after1, selectGame({ gameId: null }));
            expect(after2.gameId).toBeNull();
        });
    });

    // ── extraReducers ─────────────────────────────────────────────────────────
    describe("fetchQuests.fulfilled", () => {
        it("stores the returned quests array", () => {
            const action = fetchQuests.fulfilled(
                mockQuests,
                "reqId",
                "game-abc"
            );
            expect(reducer(undefined, action).quests).toEqual(mockQuests);
        });

        it("replaces any existing quests", () => {
            const first = fetchQuests.fulfilled(
                [mockQuests[0]],
                "req1",
                "game-abc"
            );
            const second = fetchQuests.fulfilled(
                [mockQuests[1]],
                "req2",
                "game-abc"
            );
            const state = reducer(reducer(undefined, first), second);
            expect(state.quests).toEqual([mockQuests[1]]);
        });
    });

    describe("acceptQuest.fulfilled", () => {
        it("merges the quest response into gameState", () => {
            const action = acceptQuest.fulfilled(mockQuestResponse, "reqId", {
                gameId: "game-abc",
                adId: "q1",
            });
            const state = reducer(undefined, action);
            expect(state.gameState.gold).toBe(mockQuestResponse.gold);
            expect(state.gameState.lives).toBe(mockQuestResponse.lives);
            expect(state.gameState.score).toBe(mockQuestResponse.score);
            expect(state.gameState.highScore).toBe(mockQuestResponse.highScore);
            expect(state.gameState.turn).toBe(mockQuestResponse.turn);
        });

        it("does NOT set gameOver when lives > 0", () => {
            const response = { ...mockQuestResponse, lives: 1 };
            const action = acceptQuest.fulfilled(response, "reqId", {
                gameId: "g",
                adId: "q",
            });
            expect(reducer(undefined, action).gameOver).toBe(false);
        });

        it("sets gameOver when lives reach 0", () => {
            const response = { ...mockQuestResponse, lives: 0 };
            const action = acceptQuest.fulfilled(response, "reqId", {
                gameId: "g",
                adId: "q",
            });
            expect(reducer(undefined, action).gameOver).toBe(true);
        });
    });

    describe("purchaseItem.fulfilled", () => {
        it("updates gold, level, lives and turn from the purchase response", () => {
            const action = purchaseItem.fulfilled(
                mockPurchaseResponse,
                "reqId",
                { gameId: "game-abc", itemId: "item-1" }
            );
            const state = reducer(undefined, action);
            expect(state.gameState.gold).toBe(mockPurchaseResponse.gold);
            expect(state.gameState.lives).toBe(mockPurchaseResponse.lives);
            expect(state.gameState.level).toBe(mockPurchaseResponse.level);
            expect(state.gameState.turn).toBe(mockPurchaseResponse.turn);
        });

        it("does NOT set gameOver when lives > 0", () => {
            const response = { ...mockPurchaseResponse, lives: 1 };
            const action = purchaseItem.fulfilled(response, "reqId", {
                gameId: "g",
                itemId: "i",
            });
            expect(reducer(undefined, action).gameOver).toBe(false);
        });

        it("sets gameOver when lives reach 0", () => {
            const response = { ...mockPurchaseResponse, lives: 0 };
            const action = purchaseItem.fulfilled(response, "reqId", {
                gameId: "g",
                itemId: "i",
            });
            expect(reducer(undefined, action).gameOver).toBe(true);
        });
    });

    describe("investigateReputation.fulfilled", () => {
        it("stores the returned reputation", () => {
            const action = investigateReputation.fulfilled(
                mockReputation,
                "reqId",
                "game-abc"
            );
            expect(reducer(undefined, action).reputation).toEqual(
                mockReputation
            );
        });

        it("increments the turn counter by 1", () => {
            const action = investigateReputation.fulfilled(
                mockReputation,
                "reqId",
                "game-abc"
            );
            // Initial turn is 0; after investigating it should be 1
            expect(reducer(undefined, action).gameState.turn).toBe(1);
        });
    });
});
