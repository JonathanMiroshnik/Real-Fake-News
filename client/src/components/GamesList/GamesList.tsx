import { DEFAULT_IMAGE } from '../../services/imageService';
import GameItem from './GameItem/GameItem';
import './GamesList.css'

// Because the Games list is not generic and there are a limited number of games, 
//  there is little reason to give a generic input parameter, instead
//  the games are loaded here individually.
function GamesList() {
    // TODO: notice that when we add more than 3 games, the list breaks, 
    //  should add vertical support
    const GAMES = [ 
        {
            title: "tic-tac-toe", 
            headImageName: DEFAULT_IMAGE,
            shortDescription: "good tic tac toe backgammon game",
            linkName: "tictactoe"
        },
        {
            title: "Trivia", 
            headImageName: DEFAULT_IMAGE,
            shortDescription: "good trivia game lol",
            linkName: "trivia"
        }
    ]; // TODO: games service?

    return (
        <div className='games-list-section'>
            <h2>GAMES:</h2>
            <div className='games-list'>            
                { GAMES.map((game, ind) => <GameItem key={"game_" + ind.toString()} {...game} />) }       
            </div>
        </div>
    );
}

export default GamesList;