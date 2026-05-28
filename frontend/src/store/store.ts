import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { spinnerSlice } from "./spinnerSlice.ts";
import { apiUrlSlice } from "./apiUrlSlice.ts";
import { gameInstanceSlice } from "./gameInstanceSlice.ts";
import { gamesSlice } from "./gamesSlice.ts";
import { logSlice } from "./logSlice.ts";
import { listenerMiddleware } from "./listenerMiddleware.ts";

export const store = configureStore({
  reducer: {
    spinner: spinnerSlice.reducer,
    gameInstance: gameInstanceSlice.reducer,
    games: gamesSlice.reducer,
    api: apiUrlSlice.reducer,
    log: logSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
