import { Message } from "../types";

export function addProbabilityWeight(msg: Message) {
    switch (msg.probability) {
        case "sure-thing":
            return {
                ...msg,
                probabilityWeight: 0,
            };
        case "piece-of-cake":
            return {
                ...msg,
                probabilityWeight: 1,
            };
        case "walk-in-the-park":
            return {
                ...msg,
                probabilityWeight: 2,
            };
        case "quite-likely":
            return {
                ...msg,
                probabilityWeight: 3,
            };
        case "hmmm":
            return {
                ...msg,
                probabilityWeight: 4,
            };
        case "risky":
            return {
                ...msg,
                probabilityWeight: 5,
            };
        case "gamble":
            return {
                ...msg,
                probabilityWeight: 6,
            };
        case "rather-detrimental":
            return {
                ...msg,
                probabilityWeight: 7,
            };
        case "playing-with-fire":
            return {
                ...msg,
                probabilityWeight: 8,
            };
        case "suicide-mission":
            return {
                ...msg,
                probabilityWeight: 9,
            };
        default:
            return {
                ...msg,
                probabilityWeight: 10,
            };;
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
