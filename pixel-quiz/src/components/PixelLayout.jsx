import React from 'react';

const PixelLayout = ({ children }) => {
    return (
        <div className="pixel-container">
            <div className="crt-overlay"></div>
            <div className="game-border">
                <div className="screen-content">
                    {children}
                </div>
            </div>

            <style>{`
        .pixel-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: #000;
          padding: 20px;
          box-sizing: border-box;
          border-radius: 20px;
          box-shadow: 0 0 50px rgba(0,0,0,0.8);
        }

        .game-border {
          border: 15px solid #444;
          border-radius: 10px;
          background: #222;
          padding: 10px;
          box-shadow: inset 0 0 20px #000;
        }

        .screen-content {
          background-color: var(--color-bg);
          border: 4px solid var(--color-border);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .crt-overlay {
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          );
          background-size: 100% 4px;
          opacity: 0.15;
        }
      `}</style>
        </div>
    );
};

export default PixelLayout;
