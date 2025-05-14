import { CellState } from "../Game/TicTacToeGame";
import Cell from "../Cell/Cell";

import './Board.css'

interface BoardProps {
    boardState: CellState[][];
    onCellAction: (row: number, col: number) => void;
    disabled?: boolean;
}

function Board({ boardState, onCellAction, disabled = false } : BoardProps) {
    return (
        <>
            { boardState.map((cellRow, row) => (
                <div key={row} className="cell_row">
                    { cellRow.map((cell, col) => (
                        <Cell key={row.toString() + " " + col.toString()} cellState={cell} row={row} column={col} 
                        setCell={onCellAction} disabled={disabled} />
                    )) }
                </div>
            )) }            
        </>
    );
}

export default Board;