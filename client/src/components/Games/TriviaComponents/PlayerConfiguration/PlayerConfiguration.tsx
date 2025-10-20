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
        <div className="trivia-player-configuration-container">
            <h1 className="trivia-player-configuration-title">Trivia Challenge</h1>
            <h2 className="trivia-player-configuration-title-player-number">Players: { playerConfigurationProps.players.length }</h2>
            
            <div className="trivia-players-grid">
                { playerConfigurationProps.players.map((player, index) => (
                    <div key={"player_config_" + player.toString() + "_" + index.toString()}>
                        <input 
                            className="trivia-player-input"
                            maxLength={MAX_LENGTH_PLAYER_NAME}
                            key={"player_input_" + index.toString()}
                            value={player.name}
                            placeholder={`Player ${index + 1}`}
                            onChange={(e) => { playerConfigurationProps.onPlayerChange(index, {name: e.target.value , score: player.score}) }}
                        />
                    </div>
                ))}
            </div>
            
            <div className="trivia-controls">
                { playerConfigurationProps.players.length < MAX_NUMBER_PLAYERS &&
                    <button className="trivia-player-configuration-button" onClick={playerConfigurationProps.addPlayer}> + </button> 
                }
                { playerConfigurationProps.players.length > MIN_NUMBER_PLAYERS &&
                    <button className="trivia-player-configuration-button" onClick={playerConfigurationProps.removePlayer}> - </button> 
                }
            </div>
        </div>
    );
}

export default PlayerConfiguration;