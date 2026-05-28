import { Quest, QuestResponse } from "../../../types/types.ts";
import { useAppDispatch, useAppSelector } from "../../../store/store.ts";
import { acceptQuest, fetchQuests } from "../../../store/thunks.ts";
import { hideSpinner, showSpinner } from "../../../store/spinnerSlice.ts";
import { ReactNode, useState } from "react";
import QuestResponseDialog from "./QuestResponseDialog.tsx";
import QuestDetailsDialog from "./QuestDetailsDialog.tsx";
import styles from "./QuestList.module.css";
import {
    decodeMessage,
    decodeProbability,
    decodeQuestId,
} from "../../../etc/decode.ts";
import { toast } from "react-toastify";

type QuestCardProps = {
    quest: Quest;
};

function drawComplexity(complexity: string): ReactNode {
    const levels = [
        "sure-thing",
        "piece-of-cake",
        "walk-in-the-park",
        "quite-likely",
        "hmmm",
        "risky",
        "gamble",
        "rather-detrimental",
        "playing-with-fire",
        "suicide-mission",
        "impossible",
    ];
    const levelIndex = levels.indexOf(complexity) + 1;
    return (
        <div>
            <span>{new Array(levelIndex).fill("●").join("")}</span>
            <span className="opacity-20">
                {new Array(levels.length - levelIndex).fill("●").join("")}
            </span>
        </div>
    );
}

export default function QuestCard({ quest }: QuestCardProps) {
    const dispatch = useAppDispatch();
    const gameId = useAppSelector((state) => state.gameInstance.gameId);

    const [questResponse, setQuestResponse] = useState<QuestResponse | null>(
        null
    );
    const [questDetailsDialog, setQuestDetailsDialog] =
        useState<boolean>(false);

    function onAcceptQuestClick(quest: Quest) {
        dispatch(showSpinner());

        dispatch(
            acceptQuest({ gameId: gameId!, adId: decodeQuestId(quest), quest })
        )
            .unwrap()
            .then((questResponse) => {
                setQuestResponse(questResponse);
                setQuestDetailsDialog(false);
            })
            .catch((error) => {
                console.error(error);
                setQuestDetailsDialog(false);
                // TODO network error dialog
            })
            .finally(() => dispatch(hideSpinner()));
    }

    function onQuestResponseClose() {
        setQuestResponse(null);
        dispatch(fetchQuests(gameId!));
    }

    const probability = decodeProbability(quest);
    const message = decodeMessage(quest);
    const { expiresIn, reward } = quest;

    return (
        <div
            className={"content_box box_border " + styles["quest-card-wrapper"]}
        >
            <div className={styles["quest-card"]}>
                <div className="flex gap-1 text-xs">
                    {drawComplexity(normalizeProbabilityName(probability))}
                    {probability}
                </div>
                <div className="text-xs">{`expires in: ${expiresIn}`}</div>
                <div className="text-xs">{`reward: ${reward}`}</div>
                <div>{message}</div>
            </div>
            <button
                onClick={() => {
                    toast("attempting to solve...", {
                        className: "toast_message",
                    });
                    setQuestDetailsDialog(true);
                }}
                className="content_button"
            >
                solve
            </button>

            {questDetailsDialog && (
                <QuestDetailsDialog
                    quest={quest}
                    onCancelQuest={() => setQuestDetailsDialog(false)}
                    onAcceptQuest={() => onAcceptQuestClick(quest)}
                />
            )}

            {questResponse && (
                <QuestResponseDialog
                    questResponse={questResponse}
                    onClose={() => onQuestResponseClose()}
                />
            )}
        </div>
    );
}

// normalize probability names the following way: 'Walk in the park' -> 'walk-in-the-park'
function normalizeProbabilityName(probability: string) {
    return probability.toLowerCase().replace(/ /g, "-").replace(/\./g, "");
}
