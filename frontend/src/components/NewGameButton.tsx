import { useAppDispatch, useAppSelector } from "../store/store.ts";
import { startGame } from "../store/thunks.ts";
import { hideSpinner, showSpinner } from "../store/spinnerSlice.ts";
// import { useNavigate } from "react-router";
import Spinner from "./Spinner.tsx";

export default function NewGameButton() {
    const dispatch = useAppDispatch();
    // const navigate = useNavigate();
    const isSpinnerVisible = useAppSelector((state) => state.spinner.visible);

    function onStartNewGameClick() {
        dispatch(showSpinner());
        dispatch(startGame())
            .unwrap()
            .finally(() => dispatch(hideSpinner()));
    }

    return (
        <button
            onClick={() => onStartNewGameClick()}
            className={
                "content_button self-start flex gap-2" +
                (isSpinnerVisible ? " opacity-70" : "")
            }
            disabled={isSpinnerVisible}
        >
            <div>+ new game</div>
            {isSpinnerVisible && <Spinner className="invert" />}
        </button>
    );
}
