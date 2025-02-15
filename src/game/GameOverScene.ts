import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number }) {
    // Simple white background
    this.cameras.main.setBackgroundColor('#ffffff');

    // Create container for content
    const container = this.add.container(400, 150);

    // Message text
    const messageText = this.add.text(0, 160, 'دوباره تلاش کنید', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Restart button
    const restartButton = this.add.rectangle(0, 320, 200, 50, 0x000000);
    const restartText = this.add.text(0, 320, 'شروع دوباره', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Add everything to container
    container.add([messageText, restartButton, restartText]);

    // Simple button interaction
    restartButton.setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'))
      .on('pointerover', () => restartButton.setFillStyle(0x333333))
      .on('pointerout', () => restartButton.setFillStyle(0x000000));
  }
}