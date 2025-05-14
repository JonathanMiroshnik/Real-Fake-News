import { Player } from "../../TriviaGame/TriviaGame";
// import './ScoreCard.css'

interface ScoreCardProps {
    player: Player;
}


function ScoreCard({ player } : ScoreCardProps) {
    return (
        <div>
            { player ? 
            <>
                <h1> {player.name} </h1>
                <h2>Score:</h2>
                <h2> {player.score} </h2>
            </>
            : null }            
        </div>
    );
}

export default ScoreCard;