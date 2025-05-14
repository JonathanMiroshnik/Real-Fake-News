import { Player } from '../TriviaGame/TriviaGame';

import './PlayerConfiguration.css'

interface PlayerConfigurationProps {
    players: Player[];
    addPlayer: () => void;
    removePlayer: () => void;
    onPlayerChange: (playerInd: number, playerToChangeTo: Player) => void;
}

export const MIN_NUMBER_PLAYERS: number = 1;
export const MAX_NUMBER_PLAYERS: number = 4;
export const MAX_LENGTH_PLAYER_NAME: number = 20;

function PlayerConfiguration(playerConfigurationProps: PlayerConfigurationProps) {
    return (
        <div>
            <h1 className="trivia-player-configuration-title"> Players: </h1>
            <h2 className="trivia-player-configuration-title-player-number"> Total: { playerConfigurationProps.players.length } </h2>
            
            <div style={{display:"flex", alignItems: "center", gap: "2rem"}}>                
                { playerConfigurationProps.players.length > 0 && <div style={{display: "blocks", gap: "1rem"}}>
                    { playerConfigurationProps.players.map((player, index) => (
                        <div key={"player_config_" + player.toString() + "_" + index.toString()}>
                            <input style={{textAlign: "center"}} maxLength={MAX_LENGTH_PLAYER_NAME}
                                key={"player_input_" + index.toString()}
                                value={player.name}
                                // Two way binding
                                onChange={(e) => { playerConfigurationProps.onPlayerChange(index, {name: e.target.value , score: player.score}) }}
                            />
                        </div>
                    ))}
                </div> }
                <div>
                    { playerConfigurationProps.players.length < MAX_NUMBER_PLAYERS &&
                        <button className="trivia-player-configuration-button" onClick={playerConfigurationProps.addPlayer}> + </button> 
                    }
                    { playerConfigurationProps.players.length > MIN_NUMBER_PLAYERS &&
                        <button className="trivia-player-configuration-button" onClick={playerConfigurationProps.removePlayer}> - </button> 
                    }
                </div>
            </div>                       
        </div>
    );
}

export default PlayerConfiguration;