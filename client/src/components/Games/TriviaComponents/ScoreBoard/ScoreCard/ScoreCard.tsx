import { Player } from "../../TriviaGame/TriviaGame";
import './ScoreCard.css'

interface ScoreCardProps {
    player: Player;
}


function ScoreCard({ player } : ScoreCardProps) {
    return (
        <div className="score-card-container">
            { player ? 
            <>
                <h1 className="player-name-text"> {player.name} </h1>
                <h2 className="score-label">Score:</h2>
                <h2 className="points-value"> {player.score} </h2>
            </>
            : null }            
        </div>
    );
}

export default ScoreCard;
