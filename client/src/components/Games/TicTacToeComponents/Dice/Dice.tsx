import { useEffect, useState } from "react";
import { DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix } from "phosphor-react";
import "./Dice.css"

export const SIDES_TO_DICE: number = 6;
const DICE_SIZE = 96;

/**
 * Componet Die which presents a number from 1 to 6.
 * @param result - Number presented on the die, from 1 to 6.
 * @param rollId - ID of the roll, if the ID changes an animation is played on the Die, indicating a change.
 */
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

    /**
     * Converts an input number and size into a die of that size and number presented on it.
     * @param num Number from 1 to 6 to be shown on the die.
     * @param diceSize Size of the die to be presented.
     * @returns Component DiceIcon of the size and presented number inputs.
     */
    function numberToDiceImage(num: number, diceSize: number) {
        if (num < 1 || num > SIDES_TO_DICE) return null;

        const icons = [null, DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix];
        const DiceIcon = icons[num];
        return DiceIcon ? <DiceIcon size={diceSize} /> : null;
    }

    return (
        <div className="dice">
            {/* 
            The "Ghost Die" is an exact equivalent die behind the functional die 
            that is used to create the animation about a change in the rollId.
            */}
            <div key={"dice-roll-id-" + animationKey} className="dice-ghost grow">
                {numberToDiceImage(result, DICE_SIZE)}
            </div>
            <div className="dice-main">
                {numberToDiceImage(result, DICE_SIZE)}
            </div>
        </div>            
    );
}

export default Dice;