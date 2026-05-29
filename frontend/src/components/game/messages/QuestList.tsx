import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import QuestCard from "./QuestCard.tsx";
import { fetchQuests } from "../../../store/thunks.ts";
import styles from "./QuestList.module.css";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";
import { useEffect } from "react";

export default function QuestList() {
    const gameId = useAppSelector((state) => state.gameInstance.gameId);
    const storeQuests = useAppSelector((state) => state.gameInstance.quests);
    const quests = [...(storeQuests || [])];

    const dispatch = useAppDispatch();

    function onRefreshQuestsClick() {
        if (gameId == null) {
            return;
        }
        dispatch(showSpinner());

        dispatch(fetchQuests({ gameId: gameId }))
            .unwrap()
            .finally(() => dispatch(hideSpinner()));
    }

    useEffect(() => {
        if (gameId == null) {
            return;
        }
        dispatch(fetchQuests({ gameId: gameId }));
    }, [gameId, dispatch]);

    return (
        <>
            <button
                className="content_button"
                onClick={() => onRefreshQuestsClick()}
            >
                refresh
            </button>
            <div className={styles["quest-list"]}>
                {quests
                    .sort((a, b) => a.expiresIn - b.expiresIn)
                    .map((quest) => (
                        <QuestCard
                            key={`quest-card-${quest.adId}`}
                            quest={quest}
                        />
                    ))}
            </div>
        </>
    );
}
