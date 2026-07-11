export type GameState = {
    activePlayer: 'A' | 'B';
    timeA: number;
    timeB: number;
    category: null | string;
    photoIndex: null | number;
    isRunning: boolean;
    deadline: null | number;
}


function remaining(state: GameState): number {
    if(state.isRunning === true && state.deadline){
        return Math.max(0, state.deadline - Date.now());
    }
    else if(state.activePlayer === 'A'){
        return state.timeA;
    } 
    else{
        return state.timeB
    }
}

// function switch_player(state: GameState): void{
//     if(state.isRunning && state.activePlayer === 'A'){
//         state.timeA = Math.max(0, state.deadline - Date.now());
//         state.activePlayer = 'B';
//     }
//     else{
//         state.timeB = Math.max(0, state.deadline - Date.now());
//         state.activePlayer = 'A';
//     }
// }