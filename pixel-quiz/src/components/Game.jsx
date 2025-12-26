import React from 'react';
import { useGame } from '../context/GameContext';
import LevelMaster from './LevelMaster';

const Game = () => {
    const { currentQuestion, currentQuestionIndex, questions, handleAnswer } = useGame();

    if (!currentQuestion) {
        return <div>Loading Question...</div>;
    }

    const { question, options } = currentQuestion;

    return (
        <div className="game-screen">
            <LevelMaster levelIndex={currentQuestionIndex} totalLevels={questions.length} />

            <div className="question-box">
                <p className="question-text">{question}</p>
            </div>

            <div className="options-grid">
                {Object.entries(options).map(([key, value]) => (
                    <button
                        key={key}
                        className="option-btn"
                        onClick={() => handleAnswer(key)}
                    >
                        <span className="key-badge">{key}</span> {value}
                    </button>
                ))}
            </div>

            <div className="progress-bar-container">
                <div className="progress-fill" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}></div>
            </div>

            <style>{`
        .game-screen {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .question-box {
          background: var(--color-card-bg);
          border: 4px solid var(--color-border);
          padding: 1.5rem;
          margin-bottom: 2rem;
          width: 100%;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,0.5);
        }

        .question-text {
          font-size: 1.2em;
          margin: 0;
          line-height: 1.4;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 600px) {
          .options-grid {
            grid-template-columns: 1fr;
          }
        }

        .option-btn {
          text-align: left;
          position: relative;
          padding-left: 3rem;
          min-height: 60px;
          display: flex;
          align-items: center;
        }

        .key-badge {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--color-warning);
          color: #000;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8em;
          border: 2px solid #000;
        }

        .progress-bar-container {
            width: 100%;
            height: 10px;
            background: #222;
            margin-top: 2rem;
            border: 2px solid #666;
            margin-bottom: 0px;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--color-success);
            transition: width 0.3s ease;
        }
      `}</style>
        </div >
    );
};

export default Game;
