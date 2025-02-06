export class CharacterSelectionScene extends Phaser.Scene {
  private selectedPlayerKey: string | null = null;
  private playerSprites: Phaser.GameObjects.Sprite[] = [];
  private startButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'CharacterSelectionScene' });
  }

  create() {
    this.add.text(400, 50, 'Choose Your Character', {
      fontSize: '48px',
      color: '#000'
    }).setOrigin(0.5);

    // Calculate positions for 4 characters
    const startX = 100;
    const spacing = 200;
    const y = 250;

    // Create 4 character slots
    for (let i = 1; i <= 4; i++) {
      const x = startX + (i - 1) * spacing;
      
      // Set initial player sprite and key
      const playerKey = `player${i}_black`;
      const playerSprite = this.add.sprite(x, y, playerKey).setScale(0.5);
      this.playerSprites.push(playerSprite);

      // Display player name
      this.add.text(x, y + 60, `Player ${i}`, {
        fontSize: '24px',
        color: '#000'
      }).setOrigin(0.5);

      // Create color selection circles for each character
      this.createColorCircles(x, y + 100, i);

      // Make sprite interactive
      playerSprite.setInteractive();
      playerSprite.on('pointerdown', () => {
        this.selectedPlayerKey = playerKey;
        this.highlightSelectedCharacter(i - 1);
      });
    }

    // Add start button below all characters
    this.startButton = this.add.text(400, y + 200, 'Start Game', {
      fontSize: '32px',
      color: 'white',
      backgroundColor: 'black',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.startGame())
    .on('pointerover', () => this.startButton.setAlpha(0.8))
    .on('pointerout', () => this.startButton.setAlpha(1));

    // Set default selection
    this.selectedPlayerKey = 'player1_black';
  }

  private createColorCircles(x: number, y: number, playerNumber: number) {
    // Create red circle
    const redBall = this.add.graphics();
    redBall.fillStyle(0xff0000, 1);
    redBall.fillCircle(x - 40, y, 15);
    redBall.setInteractive(new Phaser.Geom.Circle(x - 40, y, 15), Phaser.Geom.Circle.Contains);
    redBall.on('pointerdown', () => this.changePlayerColor(playerNumber, 'red'));

    // Create gray circle
    const grayBall = this.add.graphics();
    grayBall.fillStyle(0x808080, 1);
    grayBall.fillCircle(x, y, 15);
    grayBall.setInteractive(new Phaser.Geom.Circle(x, y, 15), Phaser.Geom.Circle.Contains);
    grayBall.on('pointerdown', () => this.changePlayerColor(playerNumber, 'gray'));

    // Create black circle
    const blackBall = this.add.graphics();
    blackBall.fillStyle(0x000000, 1);
    blackBall.fillCircle(x + 40, y, 15);
    blackBall.setInteractive(new Phaser.Geom.Circle(x + 40, y, 15), Phaser.Geom.Circle.Contains);
    blackBall.on('pointerdown', () => this.changePlayerColor(playerNumber, 'black'));
  }

  private changePlayerColor(playerNumber: number, color: string) {
    const selectedPlayerKey = `player${playerNumber}_${color}`;
    this.selectedPlayerKey = selectedPlayerKey;
    
    if (this.playerSprites[playerNumber - 1]) {
      this.playerSprites[playerNumber - 1].setTexture(selectedPlayerKey);
    }
  }

  private highlightSelectedCharacter(index: number) {
    this.playerSprites.forEach((sprite, i) => {
      sprite.setTint(i === index ? 0x00ff00 : 0xffffff);
    });
  }

  private startGame() {
    if (this.selectedPlayerKey) {
      this.scene.start('GameScene', { playerKey: this.selectedPlayerKey });
    } else {
      console.error('No player selected!');
    }
  }
}