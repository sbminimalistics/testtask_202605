import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import QuestCard from "./QuestCard.tsx";
import { fetchQuests } from "../../../store/thunks.ts";
import styles from "./QuestList.module.css";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";

export default function QuestList() {
    const gameId = useAppSelector((state) => state.gameInstance.gameId);
    const quests = [...useAppSelector((state) => state.gameInstance.quests)];

    const dispatch = useAppDispatch();

    function onRefreshQuestsClick() {
        dispatch(showSpinner());

        dispatch(fetchQuests(gameId!))
            .unwrap()
            .finally(() => dispatch(hideSpinner()));
    }

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
