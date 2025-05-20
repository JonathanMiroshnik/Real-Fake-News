import { Link } from 'react-router';
import './GameItem.css'

/**
 * Component to show a Game
 * @param title - Name/Title of the Game.
 * @param headImageName - Logo image of the Game.
 * @param shortDescription - Description of the Game.
 * @param linkName - Link page name of the Game.
 */
interface GameItemProps {
    title: string;
    headImageName: string;
    shortDescription: string;
    linkName: string;
}

function GameItem({title, headImageName, shortDescription, linkName}: GameItemProps) {
    return (        
        <Link className="game-item-separator" to={`/games/${linkName}`}>
            <div className="game-item">                
                <div className="game-item-text">
                    <b className="game-item-title">{ title }</b>
                    <br/>
                    <p className="game-item-description">{ shortDescription }</p>
                </div>
                <img className="game-item-image" src={headImageName}/>
            </div>            
        </Link>
    );
}

export default GameItem;