import Phaser from 'phaser';
import { PreloadScene } from './PreloadScene';
import { CharacterSelectionScene } from './CharacterSelectionScene';
import { GameScene } from './GameScene';
import { GameOverScene } from './GameOverScene';
import { LevelCompleteScene } from './LevelCompleteScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1500,
  height: 800,
  parent: 'game-container',
  backgroundColor: '#ffffff', // Sky blue background
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, CharacterSelectionScene, GameScene, GameOverScene, LevelCompleteScene]
};