import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store.ts";

type SpinnerState = {
    visible: boolean;
};

const initialSpinnerState: SpinnerState = {
    visible: false,
};

export const spinnerSlice = createSlice({
    name: "spinnerSlice",
    initialState: initialSpinnerState,
    reducers: {
        showSpinner: (state) => {
            state.visible = true;
        },
        hideSpinner: (state) => {
            state.visible = false;
        },
    },
});

export const isSpinnerVisible = (state: RootState) => state.spinner.visible;
export const { showSpinner, hideSpinner } = spinnerSlice.actions;
