import { Message } from "../types";

export function decryptMessage(msg: Message) {
    switch (msg.encrypted) {
        case 1:
            return {
                ...msg,
                adId: atob(msg.adId),
                message: atob(msg.message),
                probability: atob(msg.probability),
            };
        case 2:
            return {
                ...msg,
                adId: rot13(msg.adId),
                message: rot13(msg.message),
                probability: rot13(msg.probability),
            };
        default:
            return msg;
    }
}

function rot13(str: string) {
    return str
        .split("")
        .map((char) =>
            String.fromCharCode(
                char.charCodeAt(0) + (char.toLowerCase() < "n" ? 13 : -13)
            )
        )
        .join("");
}
