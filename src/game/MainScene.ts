import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private dino!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.GameObjects.Line;
  private scoreText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameStarted: boolean = false;
  private score: number = 0;
  private spawnTimer: number = 0;
  private gameSpeed: number = 300;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // Clear the background and set it to red
    this.cameras.main.setBackgroundColor(0xff0000);
  
    // Calculate the middle Y position of the screen
    const middleY = this.cameras.main.height / 2;
  
    // Create ground (red horizontal line) at the middle of the page
    this.ground = this.add.line(0, middleY, 0, 0, 800, 0, 0xff0000);
    this.physics.add.existing(this.ground, true);
  
    // Create player slightly above the ground
    this.dino = this.physics.add.sprite(100, middleY - 50, 'dino');
    this.dino.setGravityY(1000);
    this.dino.setCollideWorldBounds(true);
    this.dino.setSize(40, 60);
  
    // Create obstacles group
    this.obstacles = this.physics.add.group();
  
    // Add colliders
    this.physics.add.collider(this.dino, this.ground);
    this.physics.add.collider(this.obstacles, this.ground);
    this.physics.add.collider(this.dino, this.obstacles, this.gameOver, undefined, this);
  
    // Setup score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#000'
    });
  
    // Setup keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
  
    // Add start text
    this.add.text(400, middleY - 100, 'Press any arrow key to start', {
      fontSize: '24px',
      color: '#000'
    }).setOrigin(0.5);
  }

  update(time: number, delta: number) {
    // Start game with first key press
    if (!this.gameStarted && (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown
    )) {
      this.gameStarted = true;
    }

    if (!this.gameStarted) return;

    // Update score
    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    // Handle player movement
    if (this.cursors.left.isDown) {
      this.dino.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.dino.setVelocityX(200);
    } else {
      this.dino.setVelocityX(0);
    }

    // Jump only when on ground
    if (this.cursors.up.isDown && this.dino.body.touching.down) {
      this.dino.setVelocityY(-500);
    }

    // Spawn obstacles
    this.spawnTimer += delta;
    if (this.spawnTimer >= 2000) { // Spawn every 2 seconds
      this.spawnObstacle();
      this.spawnTimer = 0;
    }

    // Remove off-screen obstacles
    this.obstacles.children.each((obstacle: Phaser.Physics.Arcade.Sprite) => {
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
      return true;
    });

    // Increase game speed over time
    this.gameSpeed = Math.min(600, 300 + Math.floor(this.score / 100) * 50);
  }

  private spawnObstacle() {
    // Create the main obstacle body
    const obstacle = this.obstacles.create(850, 400, 'obstacle');
    obstacle.setVelocityX(-this.gameSpeed);
    obstacle.setImmovable(true);
    obstacle.setSize(30, 50); // Main hitbox (top and bottom)
  
    // Add left side physics body
    const leftSide = this.physics.add.sprite(obstacle.x - 15, obstacle.y, 'obstacle'); // Adjust x position
    leftSide.setSize(10, 50); // Left side hitbox (10px width)
    leftSide.setImmovable(true);
    leftSide.setVisible(false); // Make it invisible
    this.obstacles.add(leftSide);
  
    // Add right side physics body
    const rightSide = this.physics.add.sprite(obstacle.x + 15, obstacle.y, 'obstacle'); // Adjust x position
    rightSide.setSize(10, 50); // Right side hitbox (10px width)
    rightSide.setImmovable(true);
    rightSide.setVisible(false); // Make it invisible
    this.obstacles.add(rightSide);
  }

  private gameOver() {
    this.scene.pause();
    this.add.text(400, 300, 'Game Over!\nClick to restart', {
      fontSize: '48px',
      color: '#000',
      align: 'center'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }
}