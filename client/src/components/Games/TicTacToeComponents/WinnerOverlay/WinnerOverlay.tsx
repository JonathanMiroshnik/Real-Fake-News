import { Symbols } from '../Game/TicTacToeGame';
import './WinnerOverlay.css'

// components/AlertOverlay.tsx
interface WinnerOverlayProps {
    winner: Symbols;
    onClose: () => void;
}

const WINNER_MESSAGE: string = "Congratulations on your victory!";
const DRAW_MESSAGE: string = "It's a Draw!";

function WinnerOverlay({ winner, onClose }: WinnerOverlayProps) {
    const theresWinner: boolean = winner === Symbols.X || winner === Symbols.O;
    const currentMessage: string = theresWinner ? WINNER_MESSAGE: DRAW_MESSAGE;

    console.log("win", currentMessage);

    return (
        <>
            { winner !== Symbols._ && <div className="winner-overlay">
                <div className="winner-content">
                    <div className="text-center">
                        {theresWinner && <h3 className="winner-title"> { Symbols[winner].toString() } is the winner!</h3>}
                        <p className="winner-message">{ currentMessage }</p>
                        <button
                            onClick={onClose}
                            className="winner-button"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div> }
        </>
    );
}

export default WinnerOverlay;