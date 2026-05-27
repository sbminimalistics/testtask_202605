import { useAppDispatch } from "../store/store.ts";
import { useState } from "react";
import { hideSpinner, showSpinner } from "../store/spinnerSlice.ts";
import useApiUrl from "../etc/useApiUrl.ts";

export default function DebugPanel() {
    const dispatch = useAppDispatch();
    const apiUrl = useApiUrl();

    const [serverCheckStatus, setServerCheckStatus] =
        useState<string>("not checked");

    function checkServer() {
        dispatch(showSpinner());

        fetch(`${apiUrl}/game/start`, {
            method: "options",
        })
            .then((response) => response.text())
            .then((data) => {
                setServerCheckStatus(`checked OK, ${new Date().toISOString()}`);
            })
            .catch((error) => {
                console.error("server check failed", error);
                setServerCheckStatus(
                    `check FAILED, ${new Date().toISOString()}`
                );
            })
            .finally(() => dispatch(hideSpinner()));
    }

    function resetGame() {
        window.location.href = "/";
    }

    return (
        <section className={"debug-panel content_box"}>
            <div>debug panel</div>
            <div>
                <button onClick={() => checkServer()}>check server</button>
                {serverCheckStatus}
            </div>
            <div>
                <button onClick={() => resetGame()}>reset game</button>
            </div>
        </section>
    );
}
