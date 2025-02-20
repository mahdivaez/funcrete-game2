import Phaser from 'phaser';

export class CharacterSelectionScene extends Phaser.Scene {
  private selectedPlayerKey: string | null = null;
  private playerSprites: Phaser.GameObjects.Sprite[] = [];
  private startButton!: Phaser.GameObjects.Rectangle;
  private selectedIndex: number = 0;
  private characterCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'CharacterSelectionScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(750, 50, 'انتخاب کاراکتر', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const startX = 450;
    const spacing = 200;
    const y = 250;

    for (let i = 1; i <= 4; i++) {
      const x = startX + (i - 1) * spacing;
      const card = this.createCharacterCard(x, y, i);
      this.characterCards.push(card);
    }

    const buttonWidth = 200;
    const buttonHeight = 50;
    this.startButton = this.add.rectangle(750, y + 200, buttonWidth, buttonHeight, 0x000000)
      .setInteractive();
    
    const buttonText = this.add.text(750, y + 200, 'شروع بازی', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.startButton
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => {
        this.startButton.setFillStyle(0x333333);
        buttonText.setScale(1.1);
      })
      .on('pointerout', () => {
        this.startButton.setFillStyle(0x000000);
        buttonText.setScale(1);
      });

    this.selectedPlayerKey = 'player1_black';
    this.highlightSelectedCharacter(0);
    this.setupKeyboardControls();
  }

  private createCharacterCard(x: number, y: number, playerNumber: number) {
    const container = this.add.container(x, y);
    
    let spriteScale;
    if (playerNumber === 2) {
      spriteScale = 0.6;  // Character 2 bigger
    } else if (playerNumber === 1) {
      spriteScale = 0.5;  // Character 1 normal
    } else {
      spriteScale = 0.35; // Characters 3 and 4 smaller
    }

    const cardBg = this.add.rectangle(0, 0, 160, 220, 0xf5f5f5);
    
    const playerKey = `player${playerNumber}_black`;
    const playerSprite = this.add.sprite(0, -20, playerKey)
      .setScale(spriteScale);
    this.playerSprites.push(playerSprite);

    const nameText = this.add.text(0, 50, `کاراکتر ${playerNumber}`, {
      fontSize: '20px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const colors = [
      { key: 'red', color: 0xff0000 },
      { key: 'gray', color: 0x808080 },
      { key: 'black', color: 0x000000 }
    ];

    const colorButtons = colors.map((colorInfo, index) => {
      const colorX = (index - 1) * 40;
      const colorY = 90;
      
      return this.add.circle(colorX, colorY, 15, colorInfo.color)
        .setInteractive()
        .on('pointerdown', () => {
          this.changePlayerColor(playerNumber, colorInfo.key);
          this.selectedIndex = playerNumber - 1;
          this.highlightSelectedCharacter(this.selectedIndex);
        })
        .on('pointerover', () => this.scaleColorButton(true, playerNumber, index))
        .on('pointerout', () => this.scaleColorButton(false, playerNumber, index));
    });

    container.add([cardBg, playerSprite, nameText, ...colorButtons]);

    cardBg.setInteractive()
      .on('pointerdown', () => {
        this.selectedPlayerKey = playerKey;
        this.selectedIndex = playerNumber - 1;
        this.highlightSelectedCharacter(this.selectedIndex);
      })
      .on('pointerover', () => {
        cardBg.setFillStyle(0xeeeeee);
      })
      .on('pointerout', () => {
        cardBg.setFillStyle(0xf5f5f5);
      });

    return container;
  }

  private scaleColorButton(isOver: boolean, playerNumber: number, colorIndex: number) {
    const card = this.characterCards[playerNumber - 1];
    const colorButton = card.getAt(colorIndex + 3) as Phaser.GameObjects.Arc;
    const scale = isOver ? 1.2 : 1;
    colorButton.setScale(scale);
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
      let baseScale;
      if (i === 1) {
        baseScale = 0.6;  // Character 2
      } else if (i === 0) {
        baseScale = 0.5;  // Character 1
      } else {
        baseScale = 0.35; // Characters 3 and 4
      }
      const scale = i === index ? baseScale * 1.2 : baseScale;
      sprite.setScale(scale);
      sprite.setTint(i === index ? 0xffffff : 0xdddddd);
    });

    this.characterCards.forEach((card, i) => {
      card.setAlpha(i === index ? 1 : 0.7);
    });
  }

  private setupKeyboardControls() {
    this.input.keyboard.on('keydown-LEFT', () => {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.highlightSelectedCharacter(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.selectedIndex = Math.min(3, this.selectedIndex + 1);
      this.highlightSelectedCharacter(this.selectedIndex);
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.startGame();
    });
  }

  private startGame() {
    if (this.selectedPlayerKey) {
      this.cameras.main.fade(500, 255, 255, 255);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene', { playerKey: this.selectedPlayerKey });
      });
    }
  }
}