import { useEffect } from "react";
import { selectGameId } from "../store/gameInstanceSlice";
import { useAppDispatch, useAppSelector } from "../store/store";
import ChangeGameButton from "../components/ChangeGameButton";

export default function Home() {
    const dispatch = useAppDispatch();
    const gameId = useAppSelector((state) => state.gameInstance.gameId);

    useEffect(() => {
        if (gameId == null) {
            return;
        }
        dispatch(selectGameId(null));
    }, [dispatch, gameId]);

    // const gameId = useAppSelector((state) => state.gameInstance.gameId);
    return (
        <div className="flex flex-col items-start gap-2">
            Visual adventure front-end <ChangeGameButton />
        </div>
    );
}
