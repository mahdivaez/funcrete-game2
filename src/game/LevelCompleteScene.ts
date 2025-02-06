import Phaser from 'phaser';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data: { score: number }) {
    const { score } = data;

    this.add.text(400, 200, 'Level Complete!', {
      fontSize: '48px',
      color: '#000'
    }).setOrigin(0.5);

    this.add.text(400, 280, `Score: ${score}`, {
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