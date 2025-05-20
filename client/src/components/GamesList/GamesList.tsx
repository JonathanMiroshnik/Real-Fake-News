import GameItem from './GameItem/GameItem';
import './GamesList.css'

/**
 * Component to show the Games
 * ----------------------------------------------------------------------------------------
 * Because the Games list is not generic and there are a limited number of games, 
 *  there is little reason to give a generic input parameter, instead
 *  the games are loaded here individually.
 */
function GamesList() {
    // TODO: notice that when we add more than 3 games, the list breaks
    // TODO: games service?
    // TODO: should add vertical support
    const GAMES = [ 
        {
            title: "tic-tac-toe", 
            headImageName: "logoTicTacToe.png",
            shortDescription: "good tic tac toe backgammon game",
            linkName: "tictactoe"
        },
        {
            title: "Trivia", 
            headImageName: "triviaGameLogo.png",
            shortDescription: "good trivia game lol",
            linkName: "trivia"
        }
    ];

    return (
        <div className="games-list-section">
            <h2 className="games-list-title">GAMES:</h2>
            <div className="games-list-items">            
                { GAMES.map((game, ind) => <GameItem key={"game_" + ind.toString()} {...game} />) }       
            </div>
        </div>
    );
}

export default GamesList;