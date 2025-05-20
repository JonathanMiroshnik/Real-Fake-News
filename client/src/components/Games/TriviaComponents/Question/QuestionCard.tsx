import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';

import './QuestionCard.css'

export interface Question {
  category: string;
  type: 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface QuestionProps {
    questionAPIStructure: Question;
    onAnswer: (correct: boolean) => void;
} 

function QuestionCard(questionProps: QuestionProps) {
    const [answers, setAnswers] = useState<string[]>([]);

    // Effect to trigger on question change
    useEffect(() => {
        randomizeAnswers();
    }, [questionProps]);

    function checkCorrect(answer: string) {
        if (answer === questionProps.questionAPIStructure.correct_answer) {
            questionProps.onAnswer(true);
            return;
        }

        questionProps.onAnswer(false);
    }

    
    function shuffle(array: string[]) {        
        for (let i = array.length - 1; i > 0; i--) { 
    
            // Generate random index 
            const j = Math.floor(Math.random() * (i + 1));
                          
            // Swap elements at indices i and j
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    function randomizeAnswers() {
        const allAnswers: string[] = [
            questionProps.questionAPIStructure.correct_answer,
            ...questionProps.questionAPIStructure.incorrect_answers
        ];

        // Special situation for when it is a "boolean" question
        if (allAnswers.length === 2) {
            setAnswers(["True", "False"]);
            return;
        }

        setAnswers(() => [...shuffle(allAnswers)]);
    }

    return (
        <div className="trivia-question-card-main">            
            <ReactMarkdown>{questionProps.questionAPIStructure.question}</ReactMarkdown>
            {answers.length > 0 && answers.map((answer, i) => (
                <button key={"trivia-answer-button-" + i.toString()} onClick={() => checkCorrect(answer)}>{answer}</button>
            ))}
        </div>
    );
}

export default QuestionCard;