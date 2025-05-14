export type TicTacToeGameMove = {
    positionX: number;
    positionY: number;
}

export interface GenerateGameMoveRequest {
    boardState: string; 
    dice: string;
    symbol: 'X'|'O';
}

export interface GenerateGameMoveResponse {
  success: boolean;
  proposedMove: TicTacToeGameMove;
  error?: string;
}
