
export type GameState = {
    activePlayer: string | 'A' | 'B';
    timeA: number;
    timeB: number;
    category: string;
    isRunning: boolean;

}