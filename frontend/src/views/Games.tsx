import { Link, Outlet, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import NewGameButton from "../components/NewGameButton.tsx";
import { useEffect } from "react";
import { resetSelectedGame, selectGameId } from "../store/gameInstanceSlice.ts";
import GameSummaryCard from "../components/gameSummary/GameSummaryCard.tsx";
import RemoveWithConfirm from "../components/RemoveWithConfirm.tsx";
import { removeGame } from "../store/gamesSlice.ts";
import ViewHeader from "./ViewHeader.tsx";

export default function Games() {
    const { gameId } = useParams();
    const games = useAppSelector((state) => state.games);
    const selectedGameId = useAppSelector((state) => state.gameInstance.gameId);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (gameId) {
            dispatch(selectGameId(gameId));
        }
    }, [gameId, dispatch]);

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
                                    cardData={g.state}
                                    children={
                                        // <div className="flex gap-1 items-end justify-between flex-wrap">
                                        <>
                                            <RemoveWithConfirm
                                                id={g.gameId}
                                                postfix="game"
                                                confirmCB={(id) => {
                                                    dispatch(removeGame(id));
                                                    if (selectedGameId === id) {
                                                        dispatch(
                                                            resetSelectedGame()
                                                        );
                                                    }
                                                }}
                                            />
                                            <Link
                                                to={`${g.gameId}/messages`}
                                                className="content_button"
                                            >
                                                select
                                            </Link>
                                            {/* </div> */}
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
