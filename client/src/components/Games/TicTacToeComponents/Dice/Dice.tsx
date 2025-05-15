import { useEffect, useState } from "react";
import { DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix } from "phosphor-react";
import "./Dice.css"

export const SIDES_TO_DICE: number = 6;
const DICE_SIZE = 96;

interface DiceProps {
    result: number;
    rollId: number;
}

function Dice({ result, rollId }: DiceProps) {
    const [animationKey, setAnimationKey] = useState<number>(0);

    // Each time the Dice result changes, a new UI "roll" occurs
    useEffect(() => {
        // Bump key to force re-render of animated ghost
        setAnimationKey(prev => prev + 1);
    }, [rollId]);

    function numberToDiceImage(num: number, diceSize: number) {
        if (num < 1 || num > SIDES_TO_DICE) return null;

        const icons = [null, DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];
        const DiceIcon = icons[num];
        return DiceIcon ? <DiceIcon size={diceSize} /> : null;
    }

    return (
        <div className="dice">
            <div key={"dice-roll-id-" + animationKey} className="dice-ghost grow">
                {numberToDiceImage(result, DICE_SIZE)}
            </div>
            <div className="dice-main">
                { numberToDiceImage(result, DICE_SIZE) }
            </div>
        </div>            
    );
}

export default Dice;