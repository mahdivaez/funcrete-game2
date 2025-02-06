import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number }) {
    const { score } = data;

    this.add.text(400, 200, 'Game Over!', {
      fontSize: '48px',
      color: '#000'
    }).setOrigin(0.5);

    this.add.text(400, 280, `Final Score: ${score}`, {
      fontSize: '32px',
      color: '#000'
    }).setOrigin(0.5);

    this.add.text(400, 350, 'Click to restart', {
      fontSize: '24px',
      color: '#000'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}