import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './game/config';

function App() {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig);
    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div id="game-container" className="rounded-lg  overflow-hidden"></div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Controls</h2>
        <p>⬅️ ➡️ Move left/right</p>
        <p>⬆️ Jump</p>
        <div className="mt-4">
        </div>
      </div>
    </div>
  );
}

export default App;