import { createListenerMiddleware } from "@reduxjs/toolkit";
import { acceptQuest, fetchQuests } from "./thunks.ts";
import { GameStatus, updateGameStatus } from "./gamesSlice.ts";

export const listenerMiddleware = createListenerMiddleware();

/**
 * After a quest is accepted and the server confirms the outcome,
 * refresh the quest list so the UI reflects the server's current state.
 */
listenerMiddleware.startListening({
    actionCreator: acceptQuest.fulfilled,
    effect: (action, { dispatch }) => {
        dispatch(fetchQuests({ gameId: action.meta.arg.gameId }));
    },
});

/**
 * After game state is updated,
 * trigger game state update fetch from api.
 */
listenerMiddleware.startListening({
    predicate: (action) => {
        return (
            updateGameStatus.match(action) &&
            action.payload.status === GameStatus.CHECKING_STATUS
        );
    },
    effect: async (action, listenerApi) => {
        if (action.payload.gameId != null) {
            listenerApi.dispatch(
                fetchQuests({ gameId: action.payload.gameId })
            );
        } else {
            listenerApi
                .getState()
                .games.forEach((val) =>
                    listenerApi.dispatch(fetchQuests({ gameId: val.gameId }))
                );
        }
    },
});
