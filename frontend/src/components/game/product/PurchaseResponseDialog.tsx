import {PurchaseResponse} from "../../../types/types.ts";
import ModalDialog from "../../ModalDialog.tsx";

type PurchaseResponseDialogProps = {
  purchaseResponse: PurchaseResponse;
  onClose: () => void;
}

export default function PurchaseResponseDialog({purchaseResponse, onClose}: PurchaseResponseDialogProps) {
  return (
      <ModalDialog closeCallback={onClose}>
        <h3>buy item success: {purchaseResponse.shoppingSuccess.toString()}</h3>

        <div className={"dialog-buttons"}>
          <button className={"close"} onClick={() => onClose()}>close</button>
        </div>
      </ModalDialog>
);
}
