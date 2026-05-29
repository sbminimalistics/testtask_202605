import { ReactNode } from "react";
import { GameState } from "../../types/types";
import styles from "./gameSummary.module.css";
import { GameStatus } from "../../store/gamesSlice";
import Spinner from "../Spinner";

export default function GameSummaryCard(props: {
    gameId: string;
    status: GameStatus;
    cardData: GameState;
    children?: ReactNode;
}) {
    const { lives, gold, level, score, highScore, turn } = props.cardData;
    return (
        <div
            className={
                "content_box box_border " +
                styles.game_summary_card +
                (props.status === GameStatus.CHECKING_STATUS
                    ? " opacity-70"
                    : "")
            }
        >
            <div className="flex justify-between flex-wrap">
                <div className="font-semibold">{`id: ${props.gameId}`}</div>
                <div>
                    {props.status === GameStatus.CHECKING_STATUS ? (
                        <Spinner />
                    ) : (
                        props.status
                    )}
                </div>
            </div>
            <div>
                <div>{`lives: ${lives}`}</div>
                <div>{`gold: ${gold}`}</div>
                <div>{`level: ${level}`}</div>
                <div>{`score: ${score}`}</div>
                <div>{`highscore: ${highScore}`}</div>
                <div>{`turn: ${turn}`}</div>
            </div>

            {props.children}
        </div>
    );
}
