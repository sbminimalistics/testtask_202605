import {PropsWithChildren, useEffect, useRef} from "react";

type ModalDialogProps = {
  closeCallback: () => void;
}

export default function ModalDialog({children, closeCallback}: PropsWithChildren<ModalDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function closeModal() {
    dialogRef.current?.close();
    closeCallback();
  }

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
      <dialog ref={dialogRef}>
        <div className={"dialog-close-cross"}>
          <button onClick={() => closeModal()}>&#x274C;</button>
        </div>
        <div className={"dialog-content"}>
          {children}
        </div>
      </dialog>
  )
}
