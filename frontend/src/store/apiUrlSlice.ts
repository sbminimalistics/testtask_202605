import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store.ts";

type ApiUrlState = {
    apiURL: string;
};

const initialSpinnerState: ApiUrlState = {
    apiURL: import.meta.env.VITE_API_HOST + "" + import.meta.env.VITE_API_PATH,
};

export const apiUrlSlice = createSlice({
    name: "apiUrlSlice",
    initialState: initialSpinnerState,
    reducers: {
        setApiUrl: (state, action: PayloadAction<string>) => {
            state.apiURL = action.payload;
        },
    },
});

export const isSpinnerVisible = (state: RootState) => state.spinner.visible;
export const { setApiUrl } = apiUrlSlice.actions;
