import { useAppDispatch, useAppSelector } from "../../store/store.ts";
import styles from "./PlayerReputation.module.css";
import { fetchQuests, investigateReputation } from "../../store/thunks.ts";

export default function PlayerReputation() {
    const gameId = useAppSelector((state) => state.gameInstance.gameId);
    const dispatch = useAppDispatch();

    const reputation = useAppSelector((state) => state.gameInstance.reputation);

    const gameOver = useAppSelector((state) => state.gameInstance.gameOver);

    function onInvestigationClick() {
        if (gameId == null) {
            return;
        }
        dispatch(investigateReputation(gameId!))
            .unwrap()
            .then(() => dispatch(fetchQuests({ gameId: gameId })));
    }

    return (
        <div>
            {!gameOver && (
                <button
                    className="content_button"
                    onClick={() => onInvestigationClick()}
                >
                    investigate
                </button>
            )}
            <div>people: {reputation.people.toFixed(1)}</div>
            <div>state: {reputation.state.toFixed(1)}</div>
            <div>underworld: {reputation.underworld.toFixed(1)}</div>
        </div>
    );
}
