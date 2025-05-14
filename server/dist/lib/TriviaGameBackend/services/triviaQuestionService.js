"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTriviaQuestions = fetchTriviaQuestions;
// TODO: need to add non-boolean questions, difficulty level changes etc.
async function fetchTriviaQuestions({ amount, type }) {
    const url = new URL('https://opentdb.com/api.php');
    url.searchParams.set('amount', amount.toString());
    // url.searchParams.set('category', category.toString());
    url.searchParams.set('type', 'boolean');
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.response_code !== 0) {
        throw new Error(`API Error ${data.response_code}: ${getErrorMessage(data.response_code)}`);
    }
    return data.results;
}
function getErrorMessage(code) {
    switch (code) {
        case 1: return 'No results found';
        case 2: return 'Invalid parameters';
        case 3: return 'Session expired';
        case 4: return 'Rate limited';
        default: return 'Unknown error';
    }
}
//# sourceMappingURL=triviaQuestionService.js.map