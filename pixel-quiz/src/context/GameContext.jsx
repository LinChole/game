import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchQuestions, submitResult } from '../services/api';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [userId, setUserId] = useState('');
    const [gameState, setGameState] = useState('HOME'); // HOME, PLAYING, LOADING, RESULT, ERROR
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // [{ questionId, selected, correct }]
    const [score, setScore] = useState(0);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);

    const resetGame = useCallback(() => {
        // Don't reset userId so they can play again easily
        setGameState('HOME');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setScore(0);
        setError(null);
        setStartTime(null);
    }, []);

    const login = useCallback((id) => {
        if (!id.trim()) return;
        setUserId(id.trim());
        // Directly go to loading/start game or just stay in HOME with valid ID?
        // Let's assume login starts the game fetching process.
        startGame(id.trim());
    }, []);

    const startGame = useCallback(async (id) => {
        try {
            setGameState('LOADING');
            setError(null);
            const loadedQuestions = await fetchQuestions(id);

            if (!loadedQuestions || loadedQuestions.length === 0) {
                throw new Error("No questions returned from server.");
            }

            setQuestions(loadedQuestions);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setScore(0);
            setStartTime(Date.now());
            setGameState('PLAYING');
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load questions.");
            setGameState('ERROR');
        }
    }, []);

    const answerQuestion = useCallback((selectedOption) => {
        if (gameState !== 'PLAYING') return;

        const currentQuestion = questions[currentQuestionIndex];
        // Assuming backend doesn't give 'correctAnswer' field in 'question' object usually to prevent cheating.
        // BUT user prompt says: "題目來源... 不包含解答欄位". 
        // So we CANNOT judge correctness client-side unless we fetched valid answers separately or the server responds with correctness.
        // Wait, the Prompt says: "成績計算：將作答結果傳送到 Google Apps Script 計算成績" (Score calculation: Send results to GAS to calculate score).
        // So we just collect answers and submit them at the end.

        // We will store the answer.
        setAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            selected: selectedOption,
            // We don't know if it's correct yet
        }]);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishGame();
        }
    }, [gameState, questions, currentQuestionIndex]);

    const finishGame = useCallback(async () => {
        setGameState('LOADING'); // Submitting...

        // We need to construct the payload for submission
        // We need to pass the answers we collected.
        // The current `answers` state might not be fully updated in this closure if we didn't use refs,
        // but since we update state and then call finishGame in the 'else' block of answerQuestion...
        // actually `setAnswers` is async. 

        // Better workflow: answerQuestion just updates state. 
        // Effect or check inside answerQuestion triggers finish.
        // Let's refactor answerQuestion to handle the "End" condition but we need the latest 'answers'.
        // We'll pass the *new* answers list to a internal submit function or just wait for render?
        // Easiest is to just pass the finalize step.

        // Actually, let's look at `answerQuestion` again.
        // If I call `setAnswers` it won't reflect immediately.
        // So I will build the new answer object, add it to a local variable, and pass THAT to submit if it's the last question.
    }, []); // We will redefine this logic inside answerQuestion or separate it.

    // Revised answerQuestion to handle submission
    const handleAnswer = useCallback(async (selectedOption) => {
        const currentQuestion = questions[currentQuestionIndex];
        const newAnswer = {
            questionId: currentQuestion.id,
            selected: selectedOption
        };

        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Game Over, Submit Results
            setGameState('LOADING');
            try {
                const payload = {
                    action: 'submitResult',
                    userId: userId,
                    answers: newAnswers,
                    timeSpent: Date.now() - startTime
                };

                const result = await submitResult(payload);
                // Result should contain { score, total, approved: bool, etc }
                // The prompt says: "成績計算... 並記錄到 Google Sheets"
                // so GAS returns the score.
                setScore(result.score || 0);
                // We might want to show detail results if GAS returns them.
                setGameState('RESULT');
            } catch (err) {
                console.error(err);
                setError("Failed to submit results. Please check connection.");
                setGameState('ERROR');
            }
        }
    }, [answers, currentQuestionIndex, questions, userId, startTime]);

    const value = {
        userId,
        gameState,
        questions,
        currentQuestionIndex,
        currentQuestion: questions[currentQuestionIndex],
        answers,
        score,
        error,
        login,
        resetGame,
        handleAnswer,
        totalQuestions: questions.length
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
