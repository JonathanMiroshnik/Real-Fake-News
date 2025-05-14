import { Player } from "../TriviaGame/TriviaGame";
import ScoreCard from "./ScoreCard/ScoreCard";

import './ScoreBoard.css'

interface ScoreBoardProps {
    players: Player[];
    currentPlayerInd: number;
}


function ScoreBoard({players, currentPlayerInd = 0} : ScoreBoardProps) {
    return (
        <div className="player-highlights">
            { players.map((p, i) => 
                <div className={`player-card-wrapper ${ i === currentPlayerInd ? "current-player-highlight" : ""}`}>
                    <ScoreCard player={p} />
                </div>
            )}
        </div>
    );
}

export default ScoreBoard;