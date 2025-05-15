import { CellState, Symbols } from "../Game/TicTacToeGame";
// import CellCounter from "../CellCounter/CellCounter";
import "./Cell.css"

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