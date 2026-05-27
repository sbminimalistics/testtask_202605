import { useAppDispatch } from "../store/store.ts";
import { fetchQuests, startGame } from "../store/thunks.ts";
import { hideSpinner, showSpinner } from "../store/spinnerSlice.ts";
import { useNavigate } from "react-router";

export default function NewGameButton() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    function onStartNewGameClick() {
        dispatch(showSpinner());
        dispatch(startGame())
            .unwrap()
            .then((gameStartResponse) => {
                navigate(
                    `/games/${gameStartResponse.gameId}`
                );
                return gameStartResponse;
            })
            .then((gameStartResponse) =>
                dispatch(fetchQuests(gameStartResponse.gameId!))
            )
            .finally(() => dispatch(hideSpinner()));
    }

    return (
        <button
            onClick={() => onStartNewGameClick()}
            className="content_button self-start"
        >
            + new game
        </button>
    );
}
