import { useState, useEffect } from "react";

import Board from "../Board/Board";
import Dice, { SIDES_TO_DICE } from "../Dice/Dice";
import WinnerOverlay from "../WinnerOverlay/WinnerOverlay";
import InformationOverlay from "../InformationOverlay/InformationOverlay";

import './TicTacToeGame.css'
import MovePresentation from "../MovePresentation/MovePresentation";

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

// Holds a state of a cell or a move.
export interface CellState {
    symbol: Symbols;
    totalDice: number;
    marked?: boolean;
}

// Indicates whether a victory was gotten, and if yes, also holds an indicator for the winner's symbol
type VictoryStatus = {
    victory: boolean;
    symbol: Symbols;
}

// Server addess for backend
const SERVER_SIDE = "http://162.0.237.138:7001"; // "http://www.sensorcensor.xyz:7001"; // http://localhost:5000

// The symbol the AI plays as.
const aiSymbol: Symbols = Symbols.O;

// Number of cells on the board's side(it works with any number >1)
const BOARD_SIDE_LENGTH = 3;
// Initial starting player object
const START_PLAYER: CellState = { symbol: Symbols.O, totalDice: 0 };
// Initial starting board object
const INITIAL_BOARD = Array.from({ length: BOARD_SIDE_LENGTH }, () =>
    Array.from({ length: BOARD_SIDE_LENGTH }, () => ({
        symbol: Symbols._,
        totalDice: 0
    }))
);

function TicTacToeGame() {
    // Indicates the current Player by his symbol and Dice number he got, to be added to the board
    const [currentPlayer, setCurrentPlayer] = useState<CellState>({ ...START_PLAYER });
    // The active game board
    const [boardCells, setBoardCells] = useState<CellState[][]>(INITIAL_BOARD);
    // Each move in the game gets a unique index
    const [moveNumber, setMoveNumber] = useState<number>(0);
    // Indicates the winner of the game
    const [victor, setVictor] = useState(Symbols._);    
    // True if showing tutorial information, explaining how to play the game
    const [showInformation, setShowInformation] = useState(false);    

    // -------------------------------------------------- Controls the AI mode of play --------------------------------------------------
    // Indicates whether AI mode is currently activated for the game
    const [aiActivated] = useState(false); // setAIActivated
    // Indicates whether the current move is the AI's
    const [aiMove, setAIMove] = useState(false);
    // The explanation of the AI for its move
    const [_, setAIExplanation] = useState<string>(""); // aiExplanation

    // Happens only once! creates board of certain sizes X and Y.
    useEffect(() => {
        resetGame();
        setCurrentPlayer(prev => nextPlayer(prev));
    }, []);
    
    useEffect(() => {
        // AI Mode
        if (aiActivated && aiMove) {
            sendAIMoveRequest(currentPlayer, boardCells);
        }

        // If the move is not possible, goes to the next move
        // TODO: indicate this visually for the players
        if (!possibleMoveExists(currentPlayer, boardCells)) {
            setTimeout(() => setCurrentPlayer(prev => nextPlayer(prev)), 1000);
        }
    }, [currentPlayer]);

    // After each change of the board, moves to the next round
    useEffect(() => {
        runGameRound();
    }, [boardCells]);

    /**
     * Resets the board cells
     */
    function resetCells() {
        setBoardCells([...INITIAL_BOARD.map((cellRow) => [...cellRow])]);
    }

    /**
     * Resets the whole game, leaving a fresh start
     */
    function resetGame() {
        setMoveNumber(0);
        setCurrentPlayer({ ...START_PLAYER });
        setVictor(Symbols._);
        resetCells();
    }

    /**
     * Checks the board for a winner.
     * @param a ?
     * @returns A VictoryStatus with a true on "victory" and the proper winner symbol, otherwise false.
     */
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

        // If there was no winner
        return {
            victory: false,
            symbol: Symbols._
        };
    }

    /**
     * Adds two numbers.
     * @param row row number.
     * @param col column number.
     * @param newCellState the move that tries to be added in the given row/column position on the board.
     * @param currentBoard Board to check the move on.
     */
    function onCellClick(row: number, col: number, newCellState: CellState, currentBoard: CellState[][]) {    
        // TODO: check for input errors ?

        // If the cell is already filled completely, it cannot be changed
        if (currentBoard[row][col].totalDice === SIDES_TO_DICE) {
            return;
        }

        // If the symbol of the cell is the same as the one that wants to add to it
        if (currentBoard[row][col].symbol === newCellState.symbol) {
            let updatedTotalDice: number = currentBoard[row][col].totalDice + newCellState.totalDice;
            if (updatedTotalDice > SIDES_TO_DICE) {
                updatedTotalDice = SIDES_TO_DICE;
            }

            setSpecificBoardCell(row,col, { symbol: newCellState.symbol, totalDice: updatedTotalDice });
        }
        else {
            // If the new value is not greater than the previous value of the cell with an opposing symbol, 
            //  we do not change the symbol.
            if (currentBoard[row][col].totalDice >= newCellState.totalDice) {
                return;
            }

            setSpecificBoardCell(row,col, { symbol: newCellState.symbol, totalDice: newCellState.totalDice });
        }
    }

    /**
     * Sets a CellState to a specific position on the board
     * @param row row number.
     * @param col column number.
     * @param newCellState the new CellState that is placed on the board in the row/column position.
     */
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

    /**
     * Returns the next Player's move.
     * @param currentMove Previous move.
     * @returns Next move in the form of a CellState.
     */
    function nextPlayer(currentMove: CellState): CellState {
        setMoveNumber(prev => prev + 1);

        const newDice: number = Math.floor(Math.random() * SIDES_TO_DICE) + 1;
        const newSymbol: Symbols = (currentMove.symbol === Symbols.X ? Symbols.O : Symbols.X);

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


    /**
     * Sends an AI move request, gets it back and performs it.
     * @param currentMove Avaliable move to send to the AI.
     * @param currentBoard Board to send to the AI.
     */
    async function sendAIMoveRequest(currentMove: CellState, currentBoard: CellState[][]) {
        const response = await fetch(SERVER_SIDE + '/api/intelligence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: boardToText(currentBoard),
                dice: currentMove.totalDice.toString(),
                symbol: Symbols[currentMove.symbol].toString()
            }),
        });

        const data = await response.json();
        const proposedMove: TicTacToeGameMove = data.proposedMove;        

        performAIMove(proposedMove);
    }

    /**
     * Adds two numbers.
     * @param a The first number.
     * @param b The second number.
     * @returns The sum of the two numbers.
     */
    function cellToText(cell: CellState): string {
        if (cell === null || cell === undefined) {
            return "";
        }
    
        return " " + Symbols[cell.symbol].toString() + " " + cell.totalDice.toString() + " ";
    }

    /**
     * Adds two numbers.
     * @param a The first number.
     * @param b The second number.
     * @returns The sum of the two numbers.
     */
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

    /**
     * Performs an AI move on the board
     * @param currentMove AI move to perform on the board
     */
    function performAIMove(currentMove: TicTacToeGameMove) {
        onCellClick(currentMove.positionX, currentMove.positionY, currentPlayer, boardCells);

        // This will switch to false after the AI move is performed in the boardCells
        //  We can be sure it will go through before the useEffect that is triggered by the boardCells
        //  because the useEffect will be triggered only after the end of this function anyways.
        setAIMove(false);
        setAIExplanation(currentMove.explanation);
    }

    /**
     * Activated after a move is registered, checks for a victory and if not, 
     *  continues to the next move.
     */
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

    // TODO: timer to next move if this is false, somehwere
    /**
     * Checks whether the current move is possible on the board.
     * @param currentMove Move to check.
     * @param currentBoard Board to check on.
     * @returns true if the move is possible, false otherwise.
     */
    function possibleMoveExists(currentMove: CellState, currentBoard: CellState[][]): boolean {
        for (let i: number = 0; i < currentBoard.length; i++) {
            for (let j: number = 0; j < currentBoard[0].length; j++) {
                if (checkMovePossible(i, j, currentMove, currentBoard)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Checks whether the current move is possible on the board in the given row/column position.
     * @param row row number.
     * @param col column number.
     * @param currentMove Move to check.
     * @param currentBoard Board to check on.
     * @returns true if the move is possible, false otherwise.
     */
    function checkMovePossible(row: number, col: number, currentMove: CellState, currentBoard: CellState[][]): boolean {
        // If the cell is already filled completely, it cannot be changed
        if (currentBoard[row][col].totalDice === SIDES_TO_DICE) {
            return false;
        }

        // If the symbol of the cell is the same as the one that wants to add to it
        if (currentBoard[row][col].symbol !== currentMove.symbol && currentBoard[row][col].symbol !== Symbols._) {
            // If the new value is not greater than the previous value of the cell with an opposing symbol, 
            //  we do not change the symbol.
            if (currentBoard[row][col].totalDice >= currentMove.totalDice) {
                return false;
            }
        }

        return true;
    }

    return (
        <div className="tictac-game-screen">
            <h1 className="tictac-game-title"><b>TIC-TAC-שש-בש</b></h1>

            {/* Information overlay */}
            {/* TODO: When BOARD_SIDE_LENGTH is 2, the tictac-game-screen div changes size when I click a cell, but it works fine for BOARD_SIDE_LENGTH > 2 */}
            { showInformation &&  <InformationOverlay onClose={ () => setShowInformation(false) } />}
            <div className="information-display-div">
                <button onClick={() => setShowInformation(true)} > ? </button>
            </div>

            {/* Winner overlay */}
            { victor !== Symbols._ && <WinnerOverlay winner={ Symbols[victor].toString() } onClose={ resetGame } /> }

            {/* AI mode controller */}
            {/* { <button onClick={() => setAIActivated(prevState => !prevState)} style={{color: (aiActivated ? "green": "red")}} > AI Mode </button> } */}            

            {/* Current Player move display */}
            {/* TODO: find a way to make the dice appear on the same row as current player status  */}
            <MovePresentation currentPlayer={currentPlayer} moveNumber={moveNumber} />

            {/* AI Mode information display */}
            {/* { aiActivated && <div style={{maxWidth: "400px", textAlign:"center"}}> 
                {aiMove ? "The AI is thinking...." : 
                <>                    
                    {aiExplanation && <><h3>The AI's Explanation:</h3> {aiExplanation}</>}
                </>}
            </div> } */}

            {/* Current board display */}
            <Board boardState={ boardCells } onCellAction={(row, col) => onCellClick(row, col, currentPlayer, boardCells)} 
                disabled={ aiMove } />
        </div>
    );
}

export default TicTacToeGame;