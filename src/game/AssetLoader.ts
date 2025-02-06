import Phaser from 'phaser';
import assetsConfig from './assets.json';

export class AssetLoader {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preloadAssets() {
    // Load player assets
    assetsConfig.players.forEach(player => {
      this.scene.load.image(player.key, player.path);
    });

    // Load all other game objects
    assetsConfig.objects.forEach(obj => {
      this.scene.load.image(obj.key, obj.path);
    });
  }

  createGameObject(key: string, x: number, y: number) {
    // Find object config
    const config = this.findObjectConfig(key);
    if (!config) {
      console.error(`Config not found for key: ${key}`);
      return null;
    }

    // Create sprite
    const sprite = this.scene.physics.add.sprite(x, y, key);
    
    // Apply configuration
    this.configureGameObject(sprite, config);
    
    return sprite;
  }

  private findObjectConfig(key: string) {
    // Check if the key belongs to a player
    const playerConfig = assetsConfig.players.find(player => player.key === key);
    if (playerConfig) return playerConfig;

    // Check if the key belongs to an object
    const objectConfig = assetsConfig.objects.find(obj => obj.key === key);
    if (objectConfig) return objectConfig;

    // If no config is found, return null
    return null;
  }

  private configureGameObject(sprite: Phaser.Physics.Arcade.Sprite, config: any) {
    // Apply scale
    sprite.setScale(config.scale);

    // Apply hitbox if defined
    if (config.hitbox) {
      sprite.setSize(config.hitbox.width, config.hitbox.height);
    }

    // Configure based on type
    switch (config.type) {
      case 'platform':
        this.configurePlatform(sprite, config);
        break;
      case 'enemy':
        this.configureEnemy(sprite, config);
        break;
      case 'collectible':
        this.configureCollectible(sprite, config);
        break;
    }
  }

  private configurePlatform(sprite: Phaser.Physics.Arcade.Sprite, config: any) {
    if (config.isStatic) {
      sprite.setImmovable(true);
      sprite.body.allowGravity = false;
    } else {
      sprite.setVelocityX(-config.speed);
    }
  }

  private configureEnemy(sprite: Phaser.Physics.Arcade.Sprite, config: any) {
    sprite.setVelocityX(-config.speed);

    if (config.category === 'flying' && config.movement) {
      switch (config.movement.type) {
        case 'sine':
          this.scene.tweens.add({
            targets: sprite,
            y: `+=${config.movement.amplitude}`,
            duration: config.movement.frequency,
            yoyo: true,
            repeat: -1
          });
          break;
      }
    }
  }

  private configureCollectible(sprite: Phaser.Physics.Arcade.Sprite, config: any) {
    sprite.body.allowGravity = false;
  }
}