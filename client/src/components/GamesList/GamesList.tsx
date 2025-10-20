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
            title: "Tic Tac Toe", 
            headImageName: "logoTicTacToe.png",
            shortDescription: "Classic strategy game for two players",
            linkName: "tictactoe"
        },
        {
            title: "Trivia Challenge", 
            headImageName: "triviaGameLogo.png",
            shortDescription: "Test your knowledge with fun questions",
            linkName: "trivia"
        }
    ];

    return (
        <div className="games-list-section">
            <div className="games-list-items">            
                { GAMES.map((game, ind) => <GameItem key={"game_" + ind.toString()} {...game} />) }       
            </div>
        </div>
    );
}

export default GamesList;