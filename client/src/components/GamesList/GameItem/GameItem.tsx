import { Link } from 'react-router';
import { getImageURL } from '../../../services/imageService';
import './GameItem.css'

interface GameItemProps {
    title: string;
    headImageName: string;
    shortDescription: string;
    linkName: string;
}

function GameItem({title, headImageName, shortDescription, linkName}: GameItemProps) {
    return (        
        <Link className='game-item-separator' to={`/games/${linkName}`}>
            <div className='game-item'>                
                <div className='game-item-text'>
                    <b className='game-item-title'>{ title }</b>
                    <br/>
                    <p className='game-item-description'>{ shortDescription }</p>
                </div>
                {/* src={getImageURL(headImageName)} /> */}
                <img className="game-item-image" src={headImageName}/>
            </div>            
        </Link>
    );
}

export default GameItem;