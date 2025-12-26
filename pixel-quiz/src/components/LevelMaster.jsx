import React from 'react';
import { getBossImage } from '../utils/avatars';

const LevelMaster = ({ levelIndex, totalLevels }) => {
    const bossUrl = getBossImage(levelIndex);

    return (
        <div className="level-master">
            <div className="boss-frame">
                <img src={bossUrl} alt={`Level ${levelIndex + 1} Boss`} className="boss-img" />
            </div>
            <div className="level-info">
                <span>LEVEL {levelIndex + 1}/{totalLevels}</span>
                <div className="hp-bar">
                    <div className="hp-fill" style={{ width: '100%' }}></div>
                </div>
            </div>

            <style>{`
        .level-master {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .boss-frame {
          width: 120px;
          height: 120px;
          border: 4px solid var(--color-border);
          background: #444;
          image-rendering: pixelated;
          margin-bottom: 10px;
          overflow: hidden;
          position: relative;
        }

        .boss-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .level-info {
          font-size: 0.8em;
          color: var(--color-warning);
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 120px;
        }

        .hp-bar {
          width: 100%;
          height: 8px;
          border: 2px solid var(--color-border);
          background: #222;
        }

        .hp-fill {
          height: 100%;
          background: var(--color-primary);
          animation: pulse-hp 2s infinite;
        }

        @keyframes pulse-hp {
          0% { background: var(--color-primary); }
          50% { background: #ff5588; }
          100% { background: var(--color-primary); }
        }
      `}</style>
        </div>
    );
};

export default LevelMaster;
