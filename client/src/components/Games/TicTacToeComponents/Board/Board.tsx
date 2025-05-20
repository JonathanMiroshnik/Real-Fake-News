import { CellState } from "../Game/TicTacToeGame";
import Cell from "../Cell/Cell";

import './Board.css'

/**
 * Componet for a MxN Board made up of Cell components 
 * @param boardState - The state of the Board, made up of CellStates
 * @param onCellAction - Function that gets the row and column of the Cell where an action was performed, 
 *                        sent by the specific Cell itself.
 * @param disabled - Possible disabling property for the Board's Cells
 */
interface BoardProps {
    boardState: CellState[][];
    onCellAction: (row: number, col: number) => void;
    disabled?: boolean;
}

function Board({ boardState, onCellAction, disabled = false } : BoardProps) {
    return (
        <>
            { boardState.map((cellRow, row) => (
                // Board is split into rows of Cells
                <div key={row} className="cell_row">
                    { cellRow.map((cell, col) => (
                        <Cell key={row.toString() + " " + col.toString()} cellState={cell} row={row} column={col}
                        setCell={onCellAction} disabled={disabled} marked={cell?.marked} />
                    )) }
                </div>
            )) }
        </>
    );
}

export default Board;