import { Outlet } from "react-router";
import GameState from "../components/game/GameState.tsx";
import { useAppSelector } from "../store/store.ts";
import GameOverView from "./GameOverView.tsx";

export default function GameInstanceView() {
    const gameOver = useAppSelector((state) => state.gameInstance.gameOver);

    return (
        <div className="w-full">
            {/* <header className={"content_box"}>
                <GameState />
            </header> */}

            {gameOver && <GameOverView />}

            <Outlet />
        </div>
    );
}
