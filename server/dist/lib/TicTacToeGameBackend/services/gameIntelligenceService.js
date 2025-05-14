"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseNextAction = chooseNextAction;
const llmService_js_1 = require("../../../services/llmService.js");
async function chooseNextAction(serviceReq) {
    // console.log(serviceReq.boardState, serviceReq.dice, serviceReq.symbol);
    // TODO: create request from current game state with proper prompt
    const prompt = `
    You and a player are playing a board game.
    \n\n
    GAME RULES:\n

    Like Tic-Tac-Toe, there is a 3x3 board and two players, X and O. _ (AKA underscore) is the symbol that indicates an empty cell. 
    The Board is initialized as empty, without either X's or O's on it.\n

    The first player is X.\n
    On each turn, the current player rolls a single die. The number on the die is the number he can place on the board, along with his symbol.\n
    If a cell is empty, any player can lay claim to it -> 
        For example, if an empty cell is claimed by X, after he rolled a 3, the Cell will display X with a value of 3.\n
    If a cell is claimed:\n
    - If its number is 6, it cannot be changed any further.\n
    - If its number is below 6, there are two scenarios:\n
    1. The player of the same symbol can add further numbers he has rolled to it -> 
        For example, if the cell had the symbol O with a number of 2, and the player O has rolled a 3, he can add to the cell, totalling 5. 
                    In the same situation, if the player rolled a 5, he can add to the 2, but that will result in 6, being the maximum possible value for a cell.\n
    2. The player of the opposite symbol can conquer a cell by rolling a higher number than what is currently in the cell -> 
        For example, if the cell had the symbol X with a number 3, and the Player O rolled a 4, he can take over the cell, and the final cell will have the symbol O with a value of 4.\n

    A victor is decided based on rows, columns, and diagonals, but only when all the relevant cells have a value of 6 -> 
    For example, if there is a row of X's, but the middle X has a value of 5, this is not a winning row. 
     If the row has the same symbol, and all of them have a value of six, the game ends and that symbol's player is declared the winner. 
    \n\n
    HOW THE INPUT OF THE GAME STATE LOOKS:\n
    The number on the dice: 1 to 6\n
    The current board state, row after row: [ Symbol Number, Symbol Number, Symbol Number ] [ Symbol Number, Symbol Number, Symbol Number ] [ Symbol Number, Symbol Number, Symbol Number ]\n
    Your symbol is: Symbol\n
    \n\n
    YOUR GOAL:\n
    return a JSON in the format I shall present examples of to you, of the next best move that supports your symbol.
    \n\n
    YOUR INPUT FOR THIS TURN:\n
    The number on the dice: ${serviceReq.dice}\n
    The current board state, row after row: ${serviceReq.boardState}\n
    Your symbol is: ${serviceReq.symbol}\n
    \n\n
    A NOTE ABOUT PROPOSED MOVES:
    A move like { positionX: 1, positionY 0 } will effect the second position of the first row.\n
    A move like { positionX: 2, positionY 2 } will effect the third position of the third row.\n
    positionX controls the column of the move, positionY control the row of the move.\n 
    \n\n
    EXAMPLES OF PLAY:\n
    To help you understand the game, I shall give you several examples of a game state, how to think about it, and how you might respond to it.
    The number on the dice: 5\n
    The current board state, row after row: [ X 6 O 3 X 1 ] [ X 6 X 6 O 6 ] [ X 4 O 1 O 6 ]\n
    Your symbol is: O\n\n
    
    In this situation, a move of { positionX: 2, positionY 0 } would bring O to almost win, by replacing the X with the number 1, however 
    It would be better to perform a move like { positionX: 0, positionY 2 } Because X 4 on the left column will almost surely win the next round 
    And so to stop that victory might be more important for O in this case.\n\n

    The number on the dice: 2\n
    The current board state, row after row: [ O 3 O 5 O 1 ] [ X 6 X 6 X 1 ] [ O 1 X 1 O 1 ]\n
    Your symbol is: O\n\n
    
    In this situation, a move of { positionX: 0, positionY 0 } would bring O closer to victory on the first row, however, 
    X is close to winning on the second row, so it could be better for O to do a move like { positionX: 2, positionY 1 } 
    and thus replace X 1 with O 2, blocking X from an easier second row victory. 
    \n\n
    GENERAL STRATEGIC NOTE:\n
    Notice that your goal is to win the game, and to win the game you must also try not to lose to the other player.\n
    You must try to both lead yourself to victory while blocking the potential winning move of the opponent.\n
    Don't forget about diagonals victories! Both for yourself as a strategy and to block your opponent.\n
    The dice are legal, meaning, you need to take into consideration that there is an equal chance for both players 
    to get any one of the following numbers in a move: 1 2 3 4 5 6 \n
    \n\n
    YOUR INPUT OF THE CURRENT GAME STATE:\n
    \n\n
    BASIC JSON FORMAT:\n
    The format shall have 3 parameters.\n
    positionX, positionY, each of these will have numbers of these options: 0, 1, 2 \n
    explanation: in which you explain your choice for the move. 
    Also, in this parameter, briefly explain what opponent moves have the most potential to happen.
    \n\n
    Your output shall be the JSON format and nothing but the JSON format, in the explanation parameter explain your choice. 
    \n\n
    EXAMPLES of JSON output:\n
    {\n
        positionX: 1,\n
        positionY: 0,\n
        explanation: I did this move because of this or that.
    },\n
    {\n
        positionX: 2,\n
        positionY: 2,\n
        explanation: This move was performed because of the following reasons
    },\n
    {\n
        positionX: 0,\n
        positionY: 2,\n
        explanation: I just felt like it
    }\n
    `;
    const request = {
        provider: 'deepseek',
        prompt: prompt,
        type: 'json_object',
    };
    const llmServiceInst = new llmService_js_1.LLMService();
    const llmResponse = await llmServiceInst.generateContent(request);
    const gameMoveRep = {
        success: llmResponse.success,
        proposedMove: JSON.parse(llmResponse.generatedText),
        error: llmResponse.error
    };
    return gameMoveRep;
}
//# sourceMappingURL=gameIntelligenceService.js.map