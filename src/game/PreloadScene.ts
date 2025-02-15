import Phaser from 'phaser';
import { AssetLoader } from './AssetLoader';
import assetsConfig from './assets.json';

export class PreloadScene extends Phaser.Scene {
  private assetLoader!: AssetLoader;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init() {
    this.assetLoader = new AssetLoader(this);
  }

  preload() {
    
    // Load all player assets
    assetsConfig.players.forEach(player => {
      this.load.image(player.key, player.path);
    });

    // Load all other game objects
    assetsConfig.objects.forEach(obj => {
      this.load.image(obj.key, obj.path);
    });
  }

  create() {
    // Start the CharacterSelectionScene after loading assets
    this.scene.start('CharacterSelectionScene');
  }
}