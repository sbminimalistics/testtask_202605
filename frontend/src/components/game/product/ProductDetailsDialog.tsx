import {Product} from "../../../types/types.ts";
import ModalDialog from "../../ModalDialog.tsx";

type ProductDetailsDialogProps = {
  product: Product;
  onAccept: () => void;
  onCancel: () => void;
}

export default function ProductDetailsDialog({product, onAccept, onCancel}: ProductDetailsDialogProps) {
  return (
      <ModalDialog closeCallback={onCancel}>
        <h3>Buy item</h3>
        <div>{product.name}</div>
        <div>{product.cost}</div>
        
        <div className={"dialog-buttons"}>
          <button className={"cancel"} onClick={() => onCancel()}>cancel</button>
          <button className={"accept"} onClick={() => onAccept()}>buy</button>
        </div>
      </ModalDialog>
  );
}
