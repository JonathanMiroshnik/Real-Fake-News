// import { useState } from "react";
import { Player } from '../TriviaGame/TriviaGame';

import './WinnerOverlay.css'

// components/AlertOverlay.tsx
interface WinnerOverlayProps {
    winner: Player | undefined;
    setIsOpen: (nextIsOpen: boolean) => void;
    onClose: () => void;
}

function WinnerOverlay({ winner, setIsOpen, onClose }: WinnerOverlayProps) {
    function closeAction() {
        setIsOpen(false);
        onClose();
    }

    return (
        <>
            { winner && <div className="winner-overlay">
                <div className="winner-content">
                    <div className="text-center">
                        <h3 className="winner-title"> { winner.name } is the winner!</h3>
                        <p className="winner-message">Congratulations on your victory!</p>
                        <button
                            onClick={closeAction}
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