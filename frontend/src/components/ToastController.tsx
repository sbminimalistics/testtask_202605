import { useEffect } from "react";
import { useAppSelector } from "../store/store.ts";
import { toast } from "react-toastify";
import { LogEntryType } from "../store/logSlice.ts";

const MSG_CUT_LENGTH = 30;
const MSG_CLOSE_DELAY_MS = 5000;

function shortenMessage(msg: string, len = MSG_CUT_LENGTH) {
    if (msg.length <= len) {
        return msg;
    } else {
        return msg.substring(0, len).concat("...");
    }
}

export default function ToastController() {
    const log = useAppSelector((state) => state.log);

    useEffect(() => {
        if (log.length === 0) {
            return;
        }
        const entry = log[0];
        let action = "";
        let targetId = "";
        let msg = "";
        let result;
        let success = false;
        if (entry.type === LogEntryType.QUEST) {
            action = "solve";
            targetId = entry.quest.adId;
            msg = shortenMessage(entry.quest.message);
            if (entry.response != null) {
                result = entry.response.message;
                success = entry.response.success;
            }
        } else if (entry.type === LogEntryType.PRODUCT) {
            action = "buy";
            targetId = entry.product.id;
            msg = shortenMessage(entry.product.name);
            if (entry.response != null) {
                result = entry.response.shoppingSuccess
                    ? "Your purchase succeeded!"
                    : "Your purchase failed!";
                success = entry.response.shoppingSuccess;
            }
        }
        const row0Msg = `gameId:${entry.gameId} | ${action}:${targetId}`;
        const row1Msg = `${msg}`;
        const finalMsg = (
            <div>
                <div className="text-xs">{row0Msg}</div>
                <div>{row1Msg}</div>
                {result && (
                    <div
                        className={success ? "text-green-700" : "text-red-700"}
                    >
                        {result}
                    </div>
                )}
            </div>
        );
        if (entry != null) {
            if (entry.response == null) {
                toast(finalMsg, {
                    className: "toast_message",
                    toastId: entry.requestId,
                    autoClose: false,
                });
            } else {
                toast.update(entry.requestId, {
                    render: finalMsg,
                    autoClose: MSG_CLOSE_DELAY_MS,
                });
            }
        }
    }, [log]);

    return null;
}
