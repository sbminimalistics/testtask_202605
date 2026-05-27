import {QuestResponse} from "../../../types/types.ts";
import ModalDialog from "../../ModalDialog.tsx";

type QuestResponseDialogProps = {
  questResponse: QuestResponse;
  onClose: () => void;
}

export default function QuestResponseDialog({questResponse, onClose}: QuestResponseDialogProps) {
  return (
      <ModalDialog closeCallback={onClose}>
        <div className={questResponse.success ? "quest-result-success" : "quest-result-failed"}>
          <h3>quest success: {questResponse.success.toString()}</h3>
          <div>{questResponse.message}</div>
        </div>

        <div className={"dialog-buttons"}>
          <button onClick={() => onClose()} className={"close"}>close</button>
        </div>
      </ModalDialog>
  )
}
