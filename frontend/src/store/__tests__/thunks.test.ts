/**
 * Unit tests for the async thunks.
 *
 * Strategy:
 *  - `global.fetch` is mocked at the module level.
 *  - Each test seeds the mock with exactly one response, dispatches the thunk
 *    against a real Redux store, then asserts on both the fetch call arguments
 *    and the resulting store state.
 */
import {
    startGame,
    fetchQuests,
    acceptQuest,
    purchaseItem,
    investigateReputation,
} from "../thunks";
import {
    createStoreWithApi,
    TEST_API_URL,
    mockGameStartResponse,
    mockQuests,
    mockQuestResponse,
    mockPurchaseResponse,
    mockReputation,
    mockFetchOnce,
} from "./testUtils";

// ---------------------------------------------------------------------------
// Setup – mock global fetch before every test
// ---------------------------------------------------------------------------

beforeEach(() => {
    global.fetch = jest.fn();
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------

describe("startGame thunk", () => {
    it("POSTs to /game/start", async () => {
        mockFetchOnce(mockGameStartResponse);
        const store = createStoreWithApi();
        await store.dispatch(startGame());

        expect(global.fetch).toHaveBeenCalledWith(
            `${TEST_API_URL}/game/start`,
            {
                method: "post",
            }
        );
    });

    it("returns a fulfilled action with the server response", async () => {
        mockFetchOnce(mockGameStartResponse);
        const store = createStoreWithApi();
        const result = await store.dispatch(startGame());

        expect(startGame.fulfilled.match(result)).toBe(true);
        expect(
            (result as ReturnType<typeof startGame.fulfilled>).payload
        ).toEqual(mockGameStartResponse);
    });

    it("updates gameInstance.gameId in the store", async () => {
        mockFetchOnce(mockGameStartResponse);
        const store = createStoreWithApi();
        await store.dispatch(startGame());

        expect(
            store
                .getState()
                .games.filter((g) => g.gameId === mockGameStartResponse.gameId)
                .length
        ).toEqual(1);
    });

    it("adds an entry to the games list in the store", async () => {
        mockFetchOnce(mockGameStartResponse);
        const store = createStoreWithApi();
        await store.dispatch(startGame());

        expect(store.getState().games).toHaveLength(1);
        expect(store.getState().games[0].gameId).toBe(
            mockGameStartResponse.gameId
        );
    });
});

// ---------------------------------------------------------------------------
// fetchQuests
// ---------------------------------------------------------------------------

describe("fetchQuests thunk", () => {
    const gameId = "game-abc";

    it("GETs /:gameId/messages", async () => {
        mockFetchOnce(mockQuests);
        const store = createStoreWithApi();
        await store.dispatch(fetchQuests({ gameId }));

        expect(global.fetch).toHaveBeenCalledWith(
            `${TEST_API_URL}/${gameId}/messages`
        );
    });

    it("returns a fulfilled action with the quest array", async () => {
        mockFetchOnce(mockQuests);
        const store = createStoreWithApi();
        const result = await store.dispatch(fetchQuests({ gameId }));

        expect(fetchQuests.fulfilled.match(result)).toBe(true);
        expect(
            (result as ReturnType<typeof fetchQuests.fulfilled>).payload
        ).toEqual(mockQuests);
    });

    it("updates gameInstance.quests in the store", async () => {
        mockFetchOnce(mockQuests);
        const store = createStoreWithApi();
        await store.dispatch(fetchQuests({ gameId }));

        expect(store.getState().gameInstance.quests).toEqual(mockQuests);
    });
});

// ---------------------------------------------------------------------------
// acceptQuest
// ---------------------------------------------------------------------------

describe("acceptQuest thunk", () => {
    const questId = { gameId: "game-abc", adId: "q1", quest: mockQuests[0] };

    it("POSTs to /:gameId/solve/:adId", async () => {
        mockFetchOnce(mockQuestResponse);
        const store = createStoreWithApi();
        await store.dispatch(acceptQuest(questId));

        expect(global.fetch).toHaveBeenCalledWith(
            `${TEST_API_URL}/${questId.gameId}/solve/${questId.adId}`,
            { method: "post" }
        );
    });

    it("returns a fulfilled action with the quest response", async () => {
        mockFetchOnce(mockQuestResponse);
        const store = createStoreWithApi();
        const result = await store.dispatch(acceptQuest(questId));

        expect(acceptQuest.fulfilled.match(result)).toBe(true);
        expect(
            (result as ReturnType<typeof acceptQuest.fulfilled>).payload
        ).toEqual(mockQuestResponse);
    });

    it("updates gold and score in the store", async () => {
        mockFetchOnce(mockQuestResponse);
        const store = createStoreWithApi();
        await store.dispatch(acceptQuest(questId));

        const gs = store.getState().gameInstance.gameState;
        expect(gs.gold).toBe(mockQuestResponse.gold);
        expect(gs.score).toBe(mockQuestResponse.score);
    });

    it("sets gameOver when the response contains lives: 0", async () => {
        mockFetchOnce({ ...mockQuestResponse, lives: 0 });
        const store = createStoreWithApi();
        await store.dispatch(acceptQuest(questId));

        expect(store.getState().gameInstance.gameOver).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// purchaseItem
// ---------------------------------------------------------------------------

describe("purchaseItem thunk", () => {
    const product = {
        gameId: "game-abc",
        id: "sword-of-doom",
        name: "Sword of doom",
        cost: 50,
    };

    it("POSTs to /:gameId/shop/buy/:itemId", async () => {
        mockFetchOnce(mockPurchaseResponse);
        const store = createStoreWithApi();
        await store.dispatch(
            purchaseItem({
                gameId: product.gameId,
                itemId: product.id,
                product,
            })
        );

        expect(global.fetch).toHaveBeenCalledWith(
            `${TEST_API_URL}/${product.gameId}/shop/buy/${product.id}`,
            { method: "post" }
        );
    });

    it("returns a fulfilled action with the purchase response", async () => {
        mockFetchOnce(mockPurchaseResponse);
        const store = createStoreWithApi();
        const result = await store.dispatch(
            purchaseItem({
                gameId: product.gameId,
                itemId: product.id,
                product,
            })
        );

        expect(purchaseItem.fulfilled.match(result)).toBe(true);
        expect(
            (result as ReturnType<typeof purchaseItem.fulfilled>).payload
        ).toEqual(mockPurchaseResponse);
    });

    it("updates gold and level in the store", async () => {
        mockFetchOnce(mockPurchaseResponse);
        const store = createStoreWithApi();
        await store.dispatch(
            purchaseItem({
                gameId: product.gameId,
                itemId: product.id,
                product,
            })
        );

        const gs = store.getState().gameInstance.gameState;
        expect(gs.gold).toBe(mockPurchaseResponse.gold);
        expect(gs.level).toBe(mockPurchaseResponse.level);
    });

    it("sets gameOver when the response contains lives: 0", async () => {
        mockFetchOnce({ ...mockPurchaseResponse, lives: 0 });
        const store = createStoreWithApi();
        await store.dispatch(
            purchaseItem({
                gameId: product.gameId,
                itemId: product.id,
                product,
            })
        );

        expect(store.getState().gameInstance.gameOver).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// investigateReputation
// ---------------------------------------------------------------------------

describe("investigateReputation thunk", () => {
    const gameId = "game-abc";

    it("POSTs to /:gameId/investigate/reputation", async () => {
        mockFetchOnce(mockReputation);
        const store = createStoreWithApi();
        await store.dispatch(investigateReputation(gameId));

        expect(global.fetch).toHaveBeenCalledWith(
            `${TEST_API_URL}/${gameId}/investigate/reputation`,
            { method: "post" }
        );
    });

    it("returns a fulfilled action with the reputation data", async () => {
        mockFetchOnce(mockReputation);
        const store = createStoreWithApi();
        const result = await store.dispatch(investigateReputation(gameId));

        expect(investigateReputation.fulfilled.match(result)).toBe(true);
        expect(
            (result as ReturnType<typeof investigateReputation.fulfilled>)
                .payload
        ).toEqual(mockReputation);
    });

    it("updates reputation in the store", async () => {
        mockFetchOnce(mockReputation);
        const store = createStoreWithApi();
        await store.dispatch(investigateReputation(gameId));

        expect(store.getState().gameInstance.reputation).toEqual(
            mockReputation
        );
    });

    it("increments the turn counter", async () => {
        mockFetchOnce(mockReputation);
        const store = createStoreWithApi();
        const turnBefore = store.getState().gameInstance.gameState.turn;
        await store.dispatch(investigateReputation(gameId));

        expect(store.getState().gameInstance.gameState.turn).toBe(
            turnBefore + 1
        );
    });
});
