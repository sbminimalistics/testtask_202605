import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    GameInstance,
    GameStartResponse,
    PurchaseResponse,
    Quest,
    QuestResponse,
    Reputation,
} from "../types/types.ts";
import {
    acceptQuest,
    fetchQuests,
    investigateReputation,
    purchaseItem,
    startGame,
} from "./thunks.ts";

const initialGameInstance: GameInstance = {
    gameId: null,
    gameState: {
        gold: 0,
        highScore: 0,
        level: 0,
        lives: 0,
        score: 0,
        turn: 0,
    },
    quests: [],
    reputation: {
        people: 0,
        underworld: 0,
        state: 0,
    },
    gameOver: false,
};

export const gameInstanceSlice = createSlice({
    name: "gameInstanceSlice",
    initialState: initialGameInstance,
    reducers: {
        gameOver: (state) => {
            state.gameOver = true;
        },
        selectGameId: (state, action) => {
            state.gameId = action.payload;
        },
        resetSelectedGame: (state) => {
            state.gameId = initialGameInstance.gameId;
            state.gameState = initialGameInstance.gameState;
            state.quests = initialGameInstance.quests;
            state.reputation = initialGameInstance.reputation;
            state.gameOver = initialGameInstance.gameOver;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            startGame.fulfilled,
            (state, action: PayloadAction<GameStartResponse>) => {
                state.gameId = action.payload.gameId;
                state.gameState = { ...action.payload };
                state.gameOver = false;
            }
        );

        builder.addCase(
            acceptQuest.fulfilled,
            (state, action: PayloadAction<QuestResponse>) => {
                state.gameState = {
                    ...state.gameState,
                    ...action.payload,
                };

                if (action.payload.lives == 0) {
                    state.gameOver = true;
                }
            }
        );

        builder.addCase(
            fetchQuests.fulfilled,
            (state, action: PayloadAction<Quest[]>) => {
                state.quests = action.payload;
            }
        );

        builder.addCase(
            purchaseItem.fulfilled,
            (state, action: PayloadAction<PurchaseResponse>) => {
                state.gameState.gold = action.payload.gold;
                state.gameState.level = action.payload.level;
                state.gameState.lives = action.payload.lives;
                state.gameState.turn = action.payload.turn;

                if (action.payload.lives == 0) {
                    state.gameOver = true;
                }
            }
        );

        builder.addCase(
            investigateReputation.fulfilled,
            (state, action: PayloadAction<Reputation>) => {
                state.reputation = action.payload;
                state.gameState.turn += 1;
            }
        );
    },
});

export const { gameOver, selectGameId, resetSelectedGame } =
    gameInstanceSlice.actions;
