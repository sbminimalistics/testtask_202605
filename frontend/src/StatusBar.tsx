import { useAppSelector } from "./store/store.ts";

import "./styles.css";
import { Link } from "react-router";

export default function StatusBar() {
    const gameInstance = useAppSelector((state) => state.gameInstance);
    const { gameId, gameState } = gameInstance;
    const { lives, gold, level, score, highScore, turn } = gameState;

    return (
        <div
            id="status_bar"
            className="sticky flex gap-2 text-xs bg-gray-200 p-2 top-0 items-center justify-between w-full"
        >
            <div className="flex flex-col items-center gap-0.5 items-start">
                <div className="flex items-center gap-2">
                    <div className="italic text-gray-500">
                        {gameId == null
                            ? "no game selected"
                            : `selected game: ${gameId}`}
                    </div>

                    <Link
                        to="/games"
                        className={
                            "content_button " +
                            (gameId == null ? "invisible" : "visible")
                        }
                    >
                        {"change game"}
                    </Link>
                </div>
                <div className="flex text-gray-500 gap-2 text-base">
                    <div>{`lives: ${lives}`}</div>
                    <div>{`gold: ${gold}`}</div>
                    <div>{`level: ${level}`}</div>
                    <div>{`score: ${score}`}</div>
                    <div>{`highscore: ${highScore}`}</div>
                    <div>{`turn: ${turn}`}</div>
                </div>
            </div>
        </div>
    );
}
