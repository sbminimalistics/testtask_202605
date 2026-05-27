import { Quest } from "../types/types.ts";

export function decodeMessage(quest: Quest) {
    switch (quest.encrypted) {
        case 1:
            return atob(quest.message);
        case 2:
            return rot13(quest.message);
        default:
            return quest.message;
    }
}

export function decodeProbability(quest: Quest) {
    switch (quest.encrypted) {
        case 1:
            return atob(quest.probability);
        case 2:
            return rot13(quest.probability);
        default:
            return quest.probability;
    }
}

export function decodeQuestId(quest: Quest) {
    switch (quest.encrypted) {
        case 1:
            return atob(quest.adId);
        case 2:
            return rot13(quest.adId);
        default:
            return quest.adId;
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
