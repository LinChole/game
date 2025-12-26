import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Home = () => {
    const { login } = useGame();
    const [inputVal, setInputVal] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputVal) {
            login(inputVal);
        }
    };

    return (
        <div className="home-screen">
            <h1>PIXEL QUIZ</h1>
            <p className="subtitle">INSERT COIN TO START</p>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="userId">PLAYER ID:</label>
                    <input
                        id="userId"
                        type="text"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder="A123"
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <button type="submit" className="start-btn">
                    START GAME
                </button>
            </form>

            <style>{`
        .home-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: fadeIn 1s ease-in;
        }

        .subtitle {
          font-size: 0.8em;
          color: var(--color-success);
          animation: blink 1s infinite;
          margin-bottom: 2rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 300px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
        }

        .start-btn {
          font-size: 1.2em;
          margin-top: 1rem;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Home;
