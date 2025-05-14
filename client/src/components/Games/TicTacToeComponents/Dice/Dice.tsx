import { useEffect } from "react";
import { DiceOne, DiceTwo, DiceThree, DiceFour, DiceFive, DiceSix } from "phosphor-react";
import "./Dice.css"

export const SIDES_TO_DICE: number = 6;
const DICE_SIZE = 96;

interface DiceProps {
    result: number;
}

// TODO: add 6 dice images and rotator of images and it lands on a number after a few seconds for suspense.
function Dice ({ result }: DiceProps) {
    // TODO: add after-roll dice function to tell the Game that the dice "finished" rolling
    // Each time the Dice result changes, a new UI "roll" occurs
    useEffect(() => {
        startGraphicalRoll();
    }, [result]);

    function startGraphicalRoll() {
        return;
    }

    function numberToDiceImage(num: number, diceSize: number) {
        if (num < 1 || num > SIDES_TO_DICE) {
            return;
        }

        switch (num) {
            case 1:
                return <DiceOne size={diceSize}/>;
            case 2:
                return <DiceTwo size={diceSize}/>;
            case 3:
                return <DiceThree size={diceSize}/>;
            case 4:
                return <DiceFour size={diceSize}/>;
            case 5:
                return <DiceFive size={diceSize}/>;
            case 6:
                return <DiceSix size={diceSize}/>;
        }        
    }

    return (
        <div className="dice">
            { numberToDiceImage(result, DICE_SIZE) }
        </div>        
    );
}

export default Dice;