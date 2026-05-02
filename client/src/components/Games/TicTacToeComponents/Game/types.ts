export enum Symbols {
  // The two game symbols
  X,
  O,
  // A symbol indicating an empty cell
  _,
  // A symbol indicating a draw
  $,
}

// TODO: add CellState to this?
export type TicTacToeGameMove = {
  positionX: number;
  positionY: number;
  explanation: string;
};

// Holds a state of a cell or a move.
export interface CellState {
  symbol: Symbols;
  totalDice: number;
  marked?: boolean;
}
