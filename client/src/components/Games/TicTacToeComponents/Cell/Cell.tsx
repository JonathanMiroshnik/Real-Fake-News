import { CellState, Symbols } from "../Game/TicTacToeGame";
import "./Cell.css"

/**
 * Componet Cell in a Board.
 * @param cellState - State controlling the data in the Cell.
 * @param row - Row in which the Cell sits in the Board.
 * @param column - Column in which the Cell sits in the Board.
 * @param setCell - Function that activates when a Cell is clicked on, 
 *                     sending the row and column of the Cell as inputs to the function.
 * @param disabled - Controls whether the button of the Cell is disabled.
 * @param marked - Controls whether the Cell is marked with a circle.
 */
interface CellProps {
    cellState: CellState;
    row: number;
    column: number;
    setCell: (r: number, c: number) => void;
    disabled: boolean;
    marked?: boolean;
}

function Cell({ cellState, row, column, setCell, disabled, marked=false } : CellProps) {
    return (
        <button className={`tictac-cell ${marked ? "tictac-cell-marked": ""}`} onClick={() => setCell(row, column)} disabled={disabled}> 
            {/* TODO: figure out aligning vertically symbol and number/counter */}
            { cellState.symbol !== Symbols._ ?
            <div>
                <p className="tictac-cell-text">
                    <b className="tictac-cell-symbol"> 
                        { Symbols[cellState.symbol].toString() } 
                    </b>
                    &nbsp;
                    {cellState.totalDice}
                </p>
            </div>: 
            null }
        </button>
    );
}

export default Cell;