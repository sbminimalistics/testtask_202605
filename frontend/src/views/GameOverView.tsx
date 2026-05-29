import { useEffect } from "react";
import { useAppSelector } from "../store/store";
import ViewHeader from "./ViewHeader";
import { useNavigate } from "react-router";

export default function GameOverView() {
    const gameInstance = useAppSelector((state) => state.gameInstance);
    const { gameId, gameState, gameOver } = gameInstance;
    const { lives, gold, level, score, highScore, turn } = gameState;

    const navigate = useNavigate();
    useEffect(() => {
        if (gameOver !== true) {
            navigate(`/games/${gameId}/messages`);
        }
    }, [gameOver, gameId, navigate]);

    return (
        <section
            className={
                "content_box justify-items-start flex flex-col items-start gap-2"
            }
        >
            <ViewHeader title={"game " + (gameId ?? "") + " is over"} />
            <div className="flex text-gray-500 gap-2 text-base ml-auto mr-auto">
                <div>{`lives: ${lives}`}</div>
                <div>{`gold: ${gold}`}</div>
                <div>{`level: ${level}`}</div>
                <div>{`score: ${score}`}</div>
                <div>{`highscore: ${highScore}`}</div>
                <div>{`turn: ${turn}`}</div>
            </div>
        </section>
    );
}
