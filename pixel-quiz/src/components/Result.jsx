import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

const Result = () => {
    const { score, totalQuestions, resetGame, userId } = useGame();

    // Need to handle missing Total Questions if undefined, defaulting for safety
    const total = totalQuestions || 5;

    const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3', 10);
    const isPass = score >= PASS_THRESHOLD;

    return (
        <div className="result-screen">
            <h1 className={isPass ? 'title-pass' : 'title-fail'}>
                {isPass ? 'YOU WIN!' : 'GAME OVER'}
            </h1>

            <div className="score-card">
                <p>PLAYER: <span className="highlight">{userId}</span></p>
                <p>SCORE: <span className="highlight">{score}</span> / {total}</p>
                <p>STATUS: <span className={isPass ? 'status-pass' : 'status-fail'}>{isPass ? 'CLEARED' : 'FAILED'}</span></p>
            </div>

            <button onClick={resetGame} className="replay-btn">
                PLAY AGAIN
            </button>

            <style>{`
        .result-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: slideUp 0.5s ease-out;
        }

        .title-pass {
          color: var(--color-success);
          font-size: 3em;
        }

        .title-fail {
          color: var(--color-primary); /* Red */
          font-size: 3em;
        }

        .score-card {
          background: #222;
          border: 4px solid var(--color-border);
          padding: 2rem;
          width: 100%;
          text-align: left;
          font-size: 1.2em;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .highlight {
          color: var(--color-warning);
        }

        .status-pass {
           color: var(--color-success);
           animation: blink 1s infinite;
        }

        .status-fail {
           color: var(--color-primary);
        }

        .replay-btn {
           margin-top: 1rem;
           border-color: var(--color-success);
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default Result;
