import './WinnerOverlay.css'

// components/AlertOverlay.tsx
interface WinnerOverlayProps {
    winner: string;
    onClose: () => void;
}

function WinnerOverlay({ winner, onClose }: WinnerOverlayProps) {
    return (
        <>
            { winner && <div className="winner-overlay">
                <div className="winner-content">
                    <div className="text-center">
                        <h3 className="winner-title"> { winner } is the winner!</h3>
                        <p className="winner-message">Congratulations on your victory!</p>
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