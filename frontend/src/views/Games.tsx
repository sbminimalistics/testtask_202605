import { Link, Outlet, useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import NewGameButton from "../components/NewGameButton.tsx";
import { useEffect } from "react";
import { resetSelectedGame, selectGame } from "../store/gameInstanceSlice.ts";
import GameSummaryCard from "../components/gameSummary/GameSummaryCard.tsx";
import RemoveWithConfirm from "../components/RemoveWithConfirm.tsx";
import {
    GameStatus,
    removeGame,
    updateGameStatus,
} from "../store/gamesSlice.ts";
import ViewHeader from "./ViewHeader.tsx";

export default function Games() {
    const { gameId } = useParams();
    const games = useAppSelector((state) => state.games);
    const selectedGameId = useAppSelector((state) => state.gameInstance.gameId);
    const gameOver = useAppSelector((state) => state.gameInstance.gameOver);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (gameId) {
            const game = games.find((g) => g.gameId === gameId);
            if (game == null) {
                navigate("/games");
            }
            dispatch(
                selectGame({
                    gameId: gameId,
                    state: game?.state,
                    status: game?.status,
                })
            );
        }
    }, [gameId, dispatch]);

    useEffect(() => {
        if (gameId != null) {
            return;
        }
        dispatch(updateGameStatus({ status: GameStatus.CHECKING_STATUS }));
    }, [dispatch, gameId]);

    useEffect(() => {
        if (gameOver !== true || gameId == null) {
            return;
        }
        navigate(`/games/${gameId}/game-over`);
    }, [navigate, gameOver, gameId]);

    return (
        <div className="flex flex-col items-start">
            {!gameId && (
                <>
                    <div className="flex flex-col gap-2 content_box">
                        <ViewHeader title="games started" />
                        <div className="flex flex-col sm:flex-row gap-1 flex-wrap">
                            {games.map((g) => (
                                <GameSummaryCard
                                    key={g.gameId}
                                    gameId={g.gameId}
                                    status={g.status}
                                    cardData={g.state}
                                    children={
                                        <>
                                            <div className="self-end mt-auto">
                                                <RemoveWithConfirm
                                                    id={g.gameId}
                                                    postfix="game"
                                                    confirmCB={(id) => {
                                                        dispatch(
                                                            removeGame(id)
                                                        );
                                                        if (
                                                            selectedGameId ===
                                                            id
                                                        ) {
                                                            dispatch(
                                                                resetSelectedGame()
                                                            );
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Link
                                                to={
                                                    g.status ===
                                                    GameStatus.RUNNING
                                                        ? `${g.gameId}/messages`
                                                        : "#"
                                                }
                                                className={
                                                    "content_button " +
                                                    (g.status ===
                                                    GameStatus.RUNNING
                                                        ? "opacity-100"
                                                        : "opacity-50")
                                                }
                                            >
                                                select
                                            </Link>
                                        </>
                                    }
                                />
                            ))}
                        </div>
                        <NewGameButton />
                    </div>
                </>
            )}
            <Outlet />
        </div>
    );
}
