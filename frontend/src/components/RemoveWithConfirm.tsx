import { useState } from "react";

export default function RemoveWithConfirm({
    id,
    name,
    nameInConfirm,
    postfix,
    confirmPostfix,
    confirmCB,
    cancelCB,
}: {
    id: string;
    name?: string;
    nameInConfirm?: string;
    postfix?: string;
    confirmPostfix?: string;
    confirmCB?: (id?: string) => void;
    cancelCB?: (id?: string) => void;
}) {
    const [isConfirmStep, setIsConfirmStep] = useState(false);

    const getName = () => {
        return name == null ? "remove" : name;
    };

    const getConfirmName = () => {
        return nameInConfirm == null ? "remove" : nameInConfirm;
    };

    const getConfirmPostfix = () => {
        return confirmPostfix == null ? "" : " " + confirmPostfix;
    };

    const toggleIsConfirmStep = () => {
        setIsConfirmStep(!isConfirmStep);
    };

    return (
        <div className="flex gap-1">
            <button
                className="content_button"
                onClick={() => {
                    toggleIsConfirmStep();
                    if (cancelCB != null) {
                        cancelCB(id);
                    }
                }}
            >
                {isConfirmStep
                    ? "cancel " + getConfirmName()
                    : getName() + (postfix != null ? " " + postfix : "")}
            </button>
            {isConfirmStep && (
                <button
                    className="content_button attention"
                    onClick={() => {
                        if (confirmCB != null) {
                            confirmCB(id);
                        }
                    }}
                >
                    confirm {getConfirmName()}
                    {getConfirmPostfix()}
                </button>
            )}
        </div>
    );
}
