import { useState, useEffect } from "react";

import Board from "../Board/Board";
import Dice, { SIDES_TO_DICE } from "../Dice/Dice";
import WinnerOverlay from "../WinnerOverlay/WinnerOverlay";
import InformationOverlay from "../InformationOverlay/InformationOverlay";

import './TicTacToeGame.css'

export enum Symbols {
    X,
    O,
    _
}

export type TicTacToeGameMove = {
    positionX: number;
    positionY: number;
    explanation: string;
}

export interface CellState {
    symbol: Symbols;
    totalDice: number;
}

type VictoryStatus = {
    victory: boolean; 
    symbol: Symbols;
}

const SERVER_SIDE = "http://162.0.237.138:7001"; // "http://www.sensorcensor.xyz:7001"; // http://localhost:5000

const aiSymbol: Symbols = Symbols.O;
const BOARD_SIDE_LENGTH = 3;
const START_PLAYER: CellState = { symbol: Symbols.O, totalDice: 0 };
const INITIAL_BOARD = Array.from({ length: BOARD_SIDE_LENGTH }, () => 
    Array.from({ length: BOARD_SIDE_LENGTH }, () => ({ 
        symbol: Symbols._, 
        totalDice: 0
    }))
);

function TicTacToeGame() {
    const [currentPlayer, setCurrentPlayer] = useState<CellState>({ ...START_PLAYER });
    const [victor, setVictor] = useState(Symbols._);
    const [boardCells, setBoardCells] = useState<CellState[][]>(INITIAL_BOARD);
    const [showInformation, setShowInformation] = useState(false);

    // Controls the AI mode of play
    const [aiActivated] = useState(false); // setAIActivated
    const [aiMove, setAIMove] = useState(false);
    const [_, setAIExplanation] = useState<string>(""); // aiExplanation

    // Happens only once! creates board of certain sizes X and Y.
    useEffect(() => {
        resetGame();
        setCurrentPlayer(prev => nextPlayer(prev));
    }, []);    

    useEffect(() => {
        if (aiMove) {
            sentAIMoveRequest();
        }        
    }, [currentPlayer]);    

    // After each change of the board, moves to the next round
    useEffect(() => {
        runGameRound();        
    }, [boardCells]);

    function resetCells() {
        setBoardCells([...INITIAL_BOARD.map((cellRow) => [...cellRow])])
    }

    function resetGame() {        
        setCurrentPlayer({ ...START_PLAYER });
        setVictor(Symbols._);
        resetCells();
    }

    function checkVictory(): VictoryStatus {
        if (BOARD_SIDE_LENGTH < 2) {
            throw new Error("The board must at least have 2 cells on each side");
        }

        let initialSymbol: Symbols = Symbols._;
        // Row victory
        for (let i = 0; i < BOARD_SIDE_LENGTH; i++) {
            initialSymbol = boardCells[i][0].symbol;
            for (let j = 0; j < BOARD_SIDE_LENGTH; j++) {
                if (initialSymbol !== boardCells[i][j].symbol ||
                    boardCells[i][j].totalDice < SIDES_TO_DICE) {
                    break;
                }

                if (j === BOARD_SIDE_LENGTH-1) {
                    return {
                        victory: true,
                        symbol: initialSymbol
                    }
                }
            }
        }

        // Column Victory
        for (let i = 0; i < BOARD_SIDE_LENGTH; i++) {
            initialSymbol = boardCells[0][i].symbol;
            for (let j = 0; j < BOARD_SIDE_LENGTH; j++) {
                if (initialSymbol !== boardCells[j][i].symbol ||
                    boardCells[j][i].totalDice < 6) {
                    break;
                }

                if (j === BOARD_SIDE_LENGTH-1) {
                    return {
                        victory: true,
                        symbol: initialSymbol
                    }
                }
            }
        }
        
        // Diagonal Victory
        // Top-left to Bottom-right
        initialSymbol = boardCells[0][0].symbol;
        for (let j = 0; j < BOARD_SIDE_LENGTH; j++) {
            if (initialSymbol !== boardCells[j][j].symbol ||
                boardCells[j][j].totalDice < 6) {
                break;
            }

            if (j === BOARD_SIDE_LENGTH-1) {
                return {
                    victory: true,
                    symbol: initialSymbol
                }
            }
        }

        // Top-right to Bottom-left
        initialSymbol = boardCells[BOARD_SIDE_LENGTH-1][0].symbol;
        for (let j = 0; j < BOARD_SIDE_LENGTH; j++) {
            if (initialSymbol !== boardCells[BOARD_SIDE_LENGTH-1-j][j].symbol ||
                boardCells[BOARD_SIDE_LENGTH-1-j][j].totalDice < 6) {
                break;
            }

            if (j === BOARD_SIDE_LENGTH-1) {
                return {
                    victory: true,
                    symbol: initialSymbol
                }
            }
        }

        return {
            victory: false,
            symbol: Symbols._
        };
    }

    function onCellClick(row: number, col: number, newCellState: CellState) {    
        // TODO: check for input errors
        console.log("cell click", row, col, newCellState);

        // If the cell is already filled completely, it cannot be changed
        if (boardCells[row][col].totalDice === SIDES_TO_DICE) {
            return;
        }

        // If the symbol of the cell is the same as the one that wants to add to it
        if (boardCells[row][col].symbol === newCellState.symbol) {
            let updatedTotalDice: number = boardCells[row][col].totalDice + newCellState.totalDice;
            if (updatedTotalDice > SIDES_TO_DICE) {
                updatedTotalDice = SIDES_TO_DICE;
            }

            setSpecificBoardCell(row,col, { symbol: newCellState.symbol, totalDice: updatedTotalDice });
        }
        else {
            // If the new value is not greater than the previous value of the cell with an opposing symbol, 
            //  we do not change the symbol.
            if (boardCells[row][col].totalDice >= newCellState.totalDice) {
                return;
            }

            setSpecificBoardCell(row,col, { symbol: newCellState.symbol, totalDice: newCellState.totalDice });
        }
    }

    function setSpecificBoardCell(row: number, col: number, newCellState: CellState) {
        setBoardCells(prev => 
            prev.map((currentRow, rowIndex) => 
                rowIndex === row 
                    ? [...currentRow.map((cell, colIndex) => (colIndex === col 
                        ? { symbol: newCellState.symbol, totalDice: newCellState.totalDice }
                        : {...cell}))]
                    : [...currentRow]
            )
        );
    }

    function nextPlayer(currentSymbol: CellState): CellState {
        const newDice: number = Math.floor(Math.random() * SIDES_TO_DICE) + 1;
        const newSymbol: Symbols = (currentSymbol.symbol === Symbols.X ? Symbols.O : Symbols.X);

        const newState: CellState = { 
            symbol: newSymbol, 
            totalDice: newDice
        }

        // Check if we are in AI mode
        if (aiActivated && newState.symbol === aiSymbol) {            
            setAIMove(true);            
        }

        return newState;
    }    

    async function sentAIMoveRequest() {
        const response = await fetch(SERVER_SIDE + '/api/intelligence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: boardToText(boardCells),
                dice: currentPlayer.totalDice.toString(), 
                symbol: Symbols[currentPlayer.symbol].toString()
            }),
        });

        const data = await response.json();
        const proposedMove: TicTacToeGameMove = data.proposedMove;        

        performAIMove(proposedMove);
    }

    function cellToText(cell: CellState): string {
        if (cell === null || cell === undefined) {
            return "";
        }
    
        return " " + Symbols[cell.symbol].toString() + " " + cell.totalDice.toString() + " ";
    }

    function boardToText(board: CellState[][]) {
        let retStr: string = "";
        board.map((row) => {
            retStr += "[";

            row.map((cell) => {
                retStr += cellToText(cell);
            })

            retStr += "] ";
        });

        return retStr;
    }

    function performAIMove(currentMove: TicTacToeGameMove) {
        onCellClick(currentMove.positionX, currentMove.positionY, currentPlayer);

        // This will switch to false after the AI move is performed in the boardCells
        //  We can be sure it will go through before the useEffect that is triggered by the boardCells
        //  because the useEffect will be triggered only after the end of this function anyways.
        setAIMove(false);
        setAIExplanation(currentMove.explanation);
    }

    function runGameRound() {                        
        // If there is a victory, we end the competition
        const victoryStatus: VictoryStatus = checkVictory();
        if (victoryStatus.victory) {
            setVictor(victoryStatus.symbol);
            return;
        }        

        // Changing to next Player with new values
        setCurrentPlayer(prev => nextPlayer(prev));
    }

    return (
        <div className="tictac-game-screen">
            <h1 className="tictac-game-title"><b>TIC-TAC-שש-בש</b></h1>
            {/* TODO: When BOARD_SIDE_LENGTH is 2, the tictac-game-screen div changes size when I click a cell, but it works fine for BOARD_SIDE_LENGTH > 2 */}
            <div className="information-display-div">
                <button onClick={() => setShowInformation(true)} > ? </button>
            </div>
            {/* { <button onClick={() => setAIActivated(prevState => !prevState)} style={{color: (aiActivated ? "green": "red")}} > AI Mode </button> } */}
            { showInformation &&  <InformationOverlay onClose={ () => setShowInformation(false) } />}
            { victor !== Symbols._ && <WinnerOverlay winner={ Symbols[victor].toString() } onClose={ resetGame } /> }            

            {/* TODO: find a way to make the dice appear on the same row as current player status  */}
            <div className="current_move">                                
                <b className="current_player">
                    <b className="current_player_symbol">
                        { Symbols[currentPlayer.symbol].toString() }
                    </b>
                    {/* 's Turn */}
                </b>
                <Dice result={ currentPlayer.totalDice } />
            </div>

            {/* { aiActivated && <div style={{maxWidth: "400px", textAlign:"center"}}> 
                {aiMove ? "The AI is thinking...." : 
                <>                    
                    {aiExplanation && <><h3>The AI's Explanation:</h3> {aiExplanation}</>}
                </>}
                <br/>
                <br/>
            </div> } */}
            <Board boardState={ boardCells } onCellAction={(row, col) => onCellClick(row, col, currentPlayer)} 
                disabled={ aiMove } />
        </div>
    );
}

export default TicTacToeGame;