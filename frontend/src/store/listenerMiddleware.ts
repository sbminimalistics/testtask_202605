import { createListenerMiddleware } from "@reduxjs/toolkit";
import { acceptQuest, fetchQuests } from "./thunks.ts";

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
