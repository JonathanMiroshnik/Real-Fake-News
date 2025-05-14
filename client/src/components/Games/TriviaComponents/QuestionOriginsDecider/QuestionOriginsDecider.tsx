import { QuestionOrigins } from "../TriviaGame/TriviaGame";

function QuestionOriginsDecider() {
    return (
        <div>
            { Object.keys(QuestionOrigins).map(origin => (
                <button>{origin}</button>
            ))}
            
            <input 
                // key={index}
                // value={player.name}
                // Two way binding
                // onChange={(e) => { playerConfigurationProps.onPlayerChange(index, {name: e.target.value , score: player.score}) }}
            />
        </div>
    );
}

export default QuestionOriginsDecider;