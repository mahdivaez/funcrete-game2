import Phaser from 'phaser';
import { AssetLoader } from './AssetLoader';
import assetsConfig from './assets.json';

export class GameScene extends Phaser.Scene {
  private assetLoader!: AssetLoader;
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private flyingEnemies!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private selectedPlayerKey: string | null = null;
  private playerPhysicsConfig: any;
  private groundSegments: Phaser.Physics.Arcade.StaticGroup;
  private gaps: { x: number; width: number; height: number }[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerKey: string }) {
    this.assetLoader = new AssetLoader(this);
    this.score = 0;
    this.selectedPlayerKey = data.playerKey;
  }

  create() {
    const playerConfig = assetsConfig.players.find(player => player.key === this.selectedPlayerKey);
    if (!playerConfig) {
      console.error('Player config not found!');
      return;
    }
  
    this.playerPhysicsConfig = playerConfig.physics;
    this.physics.world.setBounds(0, 0, 24500, 600);
  
    // Initialize groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();
    this.obstacles = this.physics.add.group();
    this.flyingEnemies = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.groundSegments = this.physics.add.staticGroup();
  
    // Calculate the ground line Y position
    const groundY = this.cameras.main.height / 3; // Assuming the ground line is at the middle of the screen
  
    // Create player
    this.player = this.assetLoader.createGameObject(
      playerConfig.key,
      playerConfig.spawnPoint.x,
      groundY - playerConfig.hitbox.height // Adjust Y position to align with the ground line
    )!;
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(playerConfig.physics.gravity);
    this.player.setSize(playerConfig.hitbox.width, playerConfig.hitbox.height);
    this.player.setOffset(0, 0);
  
    // Setup camera
    this.cameras.main.setBounds(0, 0, 24500, 600);
    this.cameras.main.startFollow(this.player, true, 0.5, 0.5);
  
    // Create game objects
    this.createGroundWithGaps();
    this.createObjects();
    this.setupCollisions();
    this.setupUI();
  
    // Enable debug (optional)
    // this.physics.world.drawDebug = true;
  
    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  private createGroundWithGaps() {
    const middleY = this.cameras.main.height * 0.7; // Move ground line lower (75% of screen height)
    const groundWidth = 110000;
    const lineThickness = 8;
  
    assetsConfig.objects.forEach(obj => {
      if (obj.type === 'gap') {
        obj.positions.forEach(pos => {
          this.gaps.push({ x: pos.x, width: obj.hitbox.width, height: obj.hitbox.height });
        });
      }
    });
  
    this.gaps.sort((a, b) => a.x - b.x);
    let startX = 0;
  
    for (const gap of this.gaps) {
      if (startX < gap.x) {
        const segment = this.add.rectangle(startX, middleY, gap.x - startX, lineThickness, 0x000000)
          .setOrigin(0, 0.5);
        this.physics.add.existing(segment, true);
        this.groundSegments.add(segment);
      }
      startX = gap.x + gap.width;
    }
  
    if (startX < groundWidth) {
      const segment = this.add.rectangle(startX, middleY, groundWidth - startX, lineThickness, 0x000000)
        .setOrigin(0, 0.5);
      this.physics.add.existing(segment, true);
      this.groundSegments.add(segment);
    }
  }

  private createObjects() {
    assetsConfig.objects.forEach(obj => {
      if (obj.type === 'platform' || obj.type === 'flying-platform') {
        obj.positions.forEach(pos => {
          let platform: Phaser.Physics.Arcade.Sprite;

          if (obj.isStatic) {
            // Static platform logic
            platform = this.physics.add.staticSprite(pos.x, pos.y, obj.key);
            platform.setScale(obj.scale);
            platform.setSize(obj.hitbox.width, obj.hitbox.height);
            platform.setOffset(0, 0);
            this.platforms.add(platform);
          } else {
            // Moving platform logic
            platform = this.physics.add.sprite(pos.x, pos.y, obj.key);
            platform.setScale(obj.scale);
            platform.setSize(obj.hitbox.width, obj.hitbox.height);
            platform.setImmovable(true);

            // Vertical movement for flying platforms
            if (obj.type === 'flying-platform' && obj.movement) {
              platform.body.allowGravity = false;
              this.tweens.add({
                targets: platform,
                y: `+=${obj.movement.amplitude}`, // Vertical movement only
                duration: obj.movement.frequency,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
              });
            } 
            // Horizontal movement for regular moving platforms
            else {
              this.tweens.add({
                targets: platform,
                x: platform.x + 200,
                duration: 2000,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
              });
            }

            this.movingPlatforms.add(platform);
          }
        });
      } else if (obj.type === 'enemy' || obj.type === 'trap') {
        // Existing enemy logic
        obj.positions.forEach(pos => {
          const obstacle = this.physics.add.sprite(pos.x, pos.y, obj.key);
          obstacle.setScale(obj.scale);
          
          obstacle.setSize(obj.hitbox.width, obj.hitbox.height);
          obstacle.setOffset(0, 0);
          obstacle.setImmovable(true);
          obstacle.body.allowGravity = false;

          if (obj.category === 'stable' || obj.category === 'static' || obj.type === 'trap') {
            this.obstacles.add(obstacle);
          }

          if (obj.category === 'flying' && obj.movement) {
            this.flyingEnemies.add(obstacle);
            this.tweens.add({
              targets: obstacle,
              y: obstacle.y + obj.movement.amplitude,
              duration: obj.movement.frequency,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1
            });
          } else if (obj.category === 'ground') {
            this.obstacles.add(obstacle);
            this.tweens.add({
              targets: obstacle,
              x: obstacle.x + 200,
              y: obstacle.y,
              duration: 2000,
              ease: 'Linear',
              yoyo: true,
              repeat: -1
            });
          }
        });
      } else if (obj.type === 'collectible') {
        // Existing collectible logic
        obj.positions.forEach(pos => {
          const coin = this.assetLoader.createGameObject(obj.key, pos.x, pos.y);
          if (coin) this.coins.add(coin);
        });
      }
    });
  }

  private setupUI() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '32px',
      color: '#ffffff'
    })
    .setScrollFactor(0);
}

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private setupCollisions() {
    // Collide player with platforms and ground segments
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player, this.groundSegments);
  
    // Handle enemy collisions
    this.physics.add.collider(this.player, this.obstacles, this.handleDeath, undefined, this);
    this.physics.add.overlap(this.player, this.flyingEnemies, this.handleDeath, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
  }

 update() {
  if (!this.player) return;

  // Movement
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-this.playerPhysicsConfig.speed.run);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(this.playerPhysicsConfig.speed.run);
  } else {
    this.player.setVelocityX(0);
  }

  // Jumping with up arrow or space key
  const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  if ((this.cursors.up.isDown || spaceKey.isDown) && this.player.body.blocked.down) {
    this.player.setVelocityY(-this.playerPhysicsConfig.speed.jump);
  }

  // Get ground line height from createGroundWithGaps()
  const groundLineY = this.cameras.main.height * 0.66; // The same as used in createGroundWithGaps()
  const deathY = groundLineY + 1; // Set death threshold slightly below the ground line

  // Lose the game if the player falls below the ground line
  if (this.player.y > deathY) {
    this.handleDeath();
  }

  // Gap detection: If player is in a gap and falling below ground line, they lose
  for (const gap of this.gaps) {
    if (this.player.x >= gap.x && this.player.x <= gap.x + gap.width && !this.player.body.blocked.down) {
      if (this.player.y > deathY) {
        this.handleDeath();
      }
    }
  }

  // Level completion
  if (this.player.x >= 24400) {
    this.scene.start('LevelCompleteScene', { score: this.score });
  }

  this.updateUI();
}


  private collectCoin(player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject) {
    coin.destroy();
    this.score += 100;
  }

  private handleDeath() {
    this.scene.start('GameOverScene', { score: this.score });
  }
}