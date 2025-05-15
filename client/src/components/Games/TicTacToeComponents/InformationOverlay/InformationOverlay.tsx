import './InformationOverlay.css'
import Board from '../Board/Board';
import { CellState, Symbols } from '../Game/TicTacToeGame';
import { useState } from 'react';
import MovePresentation from '../MovePresentation/MovePresentation';

// RULES:
// Like Tic-Tac-Toe, there is a 3x3 board and two players, X and O.
// The Board is initialized as empty, without either X's or O's on it.
// The first player is X.
// On each turn, the current player rolls a single die. The number on the die is the number he can place on the board, along with his symbol.
// If a cell is empty, any player can lay claim to it -> 
//     For example, if an empty cell is claimed by X, after he rolled a 3, the Cell will display X with a value of 3.
// If a cell is claimed:
// - If its number is 6, it cannot be changed any further.
// - If its number is below 6, there are two scenarios:
// 1. The player of the same symbol can add further numbers he has rolled to it ->
//     For example, if the cell had the symbol O with a number of 2, and the player O has rolled a 3, he can add to the cell, totalling 5.
//                 In the same situation, if the player rolled a 5, he can add to the 2, but that will result in 6, being the maximum possible value for a cell.
// 2. The player of the opposite symbol can conquer a cell by rolling a higher number than what is currently in the cell ->
//     For example, if the cell had the symbol X with a number 3, and the Player O rolled a 4, he can take over the cell, 
//     and the final cell will have the symbol O with a value of 4.

// A victor is decided based on rows, columns, and diagonals, but only when all the relevant cells have a value of 6 ->
//     For example, if there is a row of X's, but the middle X has a value of 5, this is not a winning row.
//      If the row has the same symbol, and all of them have a value of six, the game ends and that symbol's player is declared the winner.

interface BoardExplanation {
    currentMove?: CellState;
    board: CellState[][];
    explanation: string;
}

interface InformationOverlayProps {
    onClose: () => void;
}

function InformationOverlay({onClose}: InformationOverlayProps) {
    const [innerMoveNumber, setInnerMoveNumber] = useState<number>(0);

    const BOARDS: BoardExplanation[] = [
    // ---------------------------------------------------------- FIRST BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: "Like in regular Tic-Tac-Toe, the board starts off empty"
        },
        // ---------------------------------------------------------- SECOND BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: "When the cube is highlighted, a player has started his move,\n a player is his symbol, and a die throw number.",
            currentMove: { symbol: Symbols.X, totalDice: 3 }
        },
        // ---------------------------------------------------------- THIRD BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3,
                    marked: true
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: "The move can be placed in any empty cell.\nThe next player's move is received and shown.",
            currentMove: { symbol: Symbols.O, totalDice: 1 }
        },
        // ---------------------------------------------------------- FOURTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.O,
                    totalDice: 1,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: "Players can \"eat\" their opponents position,\nO could not do that this time because he rolled a 1\nHowever, X has now rolled a 2.",
            currentMove: { symbol: Symbols.X, totalDice: 2 }
        },
        // ---------------------------------------------------------- FIFTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 2,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `X has eaten the middle O with the value of 1,\n
                        because it could, and it replaced it with an X with a value of 2.\n
                        O has now landed a 1 again, because it cannot eat anyone, it must\n
                        take an empty cell.`,
            currentMove: { symbol: Symbols.O, totalDice: 1 }
        },
        // ---------------------------------------------------------- SIXTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 2,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols.O,
                    totalDice: 1
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `X has rolled a 3, instead of eating the O with the value of 1,\nHe adds 3 to his center 2, achieving a total value of 5.`,
            currentMove: { symbol: Symbols.X, totalDice: 3 }
        },
        // ---------------------------------------------------------- SEVENTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols.O,
                    totalDice: 1,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `O has rolled a 4, instead of eating the X with the value of 3,\nHe adds 4 to his bottom left 1, achieving a total value of 5.`,
            currentMove: { symbol: Symbols.O, totalDice: 4 }
        },
        // ---------------------------------------------------------- EIGHTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ], [
                {
                    symbol: Symbols.O,
                    totalDice: 5,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `X has rolled a 6, he decides to eat the O with the value of 5 on the bottom left of the board.`,
            currentMove: { symbol: Symbols.X, totalDice: 6 }
        },
        // ---------------------------------------------------------- NINTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                }
            ], [
                {
                    symbol: Symbols.X,
                    totalDice: 6
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `Notice that the game did not end, as X did not get a FULL diagonal of entirely 6s,\nO can still turn this around with luck.`,
            currentMove: { symbol: Symbols.O, totalDice: 2 }
        },
        // ---------------------------------------------------------- TENTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 3,
                    marked: true
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5
                },
                {
                    symbol: Symbols.O,
                    totalDice: 2,
                }
            ], [
                {
                    symbol: Symbols.X,
                    totalDice: 6
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `However, O does not seem to have luck on his side.\n
                            X gets a 5, and by combining it with his X with a value of 3,\n
                            he gets a maximum of 6, an un-eatable cell.`,
            currentMove: { symbol: Symbols.X, totalDice: 5 }
        },
        // ---------------------------------------------------------- ELEVENTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                },
                {
                    symbol: Symbols.X,
                    totalDice: 6
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5
                },
                {
                    symbol: Symbols.O,
                    totalDice: 2,
                    marked: true
                }
            ], [
                {
                    symbol: Symbols.X,
                    totalDice: 6
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                    marked: true
                }
            ]],
            explanation: `From here two possible scenarios are played out, if O gets a 5 or below,\nHe will lose, as X will surely win in the next round.`,
            currentMove: { symbol: Symbols.O, totalDice: 5 }
        },
        // ---------------------------------------------------------- TWELTH BOARD ----------------------------------------------------------
        {
            board: [[
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 6
                }
            ], [
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols.X,
                    totalDice: 5,
                    marked: true
                },
                {
                    symbol: Symbols.O,
                    totalDice: 2,
                }
            ], [
                {
                    symbol: Symbols.X,
                    totalDice: 6
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                },
                {
                    symbol: Symbols._,
                    totalDice: 0,
                }
            ]],
            explanation: `If O gets a 6,\nHe will be able to eat the middle X with a value of 5 and destroy X's strategy.\n\nPLEASE ENJOY\n\nTIC-TAC-TOE-BACKGAMMON!`,
            currentMove: { symbol: Symbols.O, totalDice: 6 }
        }
    ];

    const [index, setIndex] = useState<number>(0);
    
    function nextPage() {
        if (index + 1 < BOARDS.length) {
            setIndex(prev => prev + 1);
            setInnerMoveNumber(prev => prev + 1);
        }
    }

    function previousPage() {
        if (index > 0) {
            setIndex(prev => prev - 1);
            setInnerMoveNumber(prev => prev + 1);
        }
    }

    function onReturnButtonClick() {
        setIndex(0);
        onClose();
    }

    return (
        <div className="information-overlay">
            {/* TODO: add "How to play:" on the top left of the information overlay */}
            <div className="information-content">
                <div className="text-center">
                    <div style={{visibility: BOARDS[index]?.currentMove ? 'visible': 'hidden'}}>
                        <MovePresentation
                        currentPlayer={BOARDS[index]?.currentMove ? BOARDS[index].currentMove: { symbol: Symbols._, totalDice: 0 }}
                        moveNumber={innerMoveNumber} />
                    </div>
                    <div>
                        <Board boardState={BOARDS[index].board} onCellAction={()=>{}} disabled={true}/>
                    </div>
                    <div className="information-overlay-explanation">
                        <div className="information-overlay-explanation-text">
                            { BOARDS[index].explanation }
                        </div>
                    </div>
                    <div>
                        <button onClick={nextPage} style={{visibility: index + 1 < BOARDS.length ? 'visible': 'hidden'}} 
                            className="information-page-move-button">
                            Next
                        </button>
                        <button onClick={previousPage} style={{visibility: index > 0 ? 'visible': 'hidden'}} 
                            className="information-page-move-button">
                            Previous
                        </button>
                    </div>
                    <button onClick={onReturnButtonClick} className="return-button">
                        Return
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InformationOverlay;
