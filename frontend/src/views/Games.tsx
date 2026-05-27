import { Link, Outlet, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../store/store.ts";
import NewGameButton from "../components/NewGameButton.tsx";
import { useEffect } from "react";
import { selectGameId } from "../store/gameInstanceSlice.ts";
import GameSummaryCard from "../components/gameSummary/GameSummaryCard.tsx";
import RemoveWithConfirm from "../components/RemoveWithConfirm.tsx";

export default function Games() {
    const { gameId } = useParams();
    const games = useAppSelector((state) => state.games);
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
                        <div>games started</div>
                        <div className="flex flex-col sm:flex-row gap-1 flex-wrap">
                            {games.map((g) => (
                                <GameSummaryCard
                                    key={g.gameId}
                                    gameId={g.gameId}
                                    cardData={g.state}
                                    children={
                                        <div className="flex gap-1 items-end justify-between flex-wrap">
                                            <RemoveWithConfirm
                                                id={g.gameId}
                                                confirmCB={(id) => {
                                                    console.log(
                                                        "remove confirmed id:",
                                                        id
                                                    );
                                                }}
                                            />
                                            <Link
                                                to={g.gameId}
                                                className="content_button ml-auto"
                                            >
                                                select
                                            </Link>
                                        </div>
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
