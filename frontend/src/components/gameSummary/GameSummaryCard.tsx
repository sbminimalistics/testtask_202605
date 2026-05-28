import { ReactNode } from "react";
import { GameState } from "../../types/types";
import styles from "./gameSummary.module.css";
import { GameStatus } from "../../store/gamesSlice";

export default function GameSummaryCard(props: {
    gameId: string;
    status: GameStatus;
    cardData: GameState;
    children?: ReactNode;
}) {
    const { lives, gold, level, score, turn } = props.cardData;
    return (
        <div className={"content_box box_border " + styles.game_summary_card}>
            <div className="flex justify-between">
                <div className="font-semibold">{`id: ${props.gameId}`}</div>
                <div>{props.status}</div>
            </div>
            <div>
                <div>{`lives: ${lives}`}</div>
                <div>{`gold: ${gold}`}</div>
                <div>{`level: ${level}`}</div>
                <div>{`score: ${score}`}</div>
                <div>{`turn: ${turn}`}</div>
            </div>

            {props.children}
        </div>
    );
}
