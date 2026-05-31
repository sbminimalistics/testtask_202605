export interface Game {
    gameId: string;
    lives: number;
    gold: number;
    level: number;
    score: number;
    highScore: number;
    turn: number;
    gameOver: boolean;
}

export interface SolveResults {
    game: Game;
}

export interface ShopItem {
    id: string;
    name: string;
    cost: number;
}

export type Message = {
    adId: string;
    message: string;
    reward: number;
    expiresIn: number;
    encrypted: number | null;
    probability: string;
    probabilityWeight: number;
};

export type SolverContext = {
    game: Game;
    messages: Message[];
    shop: ShopItem[];
    scoreTarget: number;
    error: string;
}
