import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import PixelLayout from './components/PixelLayout';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result';
import './App.css'; // Optional, likely empty now

const GameContent = () => {
  const { gameState, error, resetGame } = useGame();

  return (
    <PixelLayout>
      {gameState === 'HOME' && <Home />}

      {gameState === 'LOADING' && (
        <div className="loading-screen">
          <p>LOADING...</p>
          <div className="spinner"></div>
        </div>
      )}

      {gameState === 'PLAYING' && <Game />}

      {gameState === 'RESULT' && <Result />}

      {gameState === 'ERROR' && (
        <div className="error-screen">
          <h2>ERROR</h2>
          <p>{error}</p>
          <button onClick={resetGame}>RETURN HOME</button>
        </div>
      )}

      <style>{`
        .loading-screen, .error-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--color-border);
          border-top-color: var(--color-warning);
          animation: spin 1s infinite steps(8);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PixelLayout>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
