import Dice from "../Dice/Dice";
import { CellState, Symbols } from "../Game/TicTacToeGame";
import './MovePresentation.css'

interface MovePresentationProps {
    currentPlayer: CellState;
    moveNumber: number;
}

function MovePresentation({currentPlayer, moveNumber}: MovePresentationProps) {
    return (
        <div className="current-move">                                
            <div className="current-player">
                <b className="current-player-symbol">
                    { Symbols[currentPlayer.symbol].toString() }
                </b>
                {/* 's Turn */}
            </div>
            <div className="current-move-dice">
                <Dice result={ currentPlayer.totalDice } rollId={moveNumber} />
            </div>
        </div>
    );
}

export default MovePresentation;