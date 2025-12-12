import GameItem from './GameItem/GameItem';

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
        <div className="m-0 p-0 flex justify-center w-full">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 max-w-[900px] mx-auto px-4 w-full max-[768px]:grid-cols-1 max-[768px]:gap-6 max-[768px]:px-2 max-[480px]:gap-4">            
                { GAMES.map((game, ind) => <GameItem key={"game_" + ind.toString()} {...game} />) }       
            </div>
        </div>
    );
}

export default GamesList;