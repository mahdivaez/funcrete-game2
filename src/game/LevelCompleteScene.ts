import Phaser from 'phaser';

export class LevelCompleteScene extends Phaser.Scene {
  private discountCode: string = 'WINNER2024';

  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  create(data: { score: number }) {
    // Simple white background
    this.cameras.main.setBackgroundColor('#ffffff');

    // Create container for content
    const container = this.add.container(740, 150);

    // Congratulations text
    const congratsText = this.add.text(0, 80, 'تبریک شما برنده شدید', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Discount text
    const discountText = this.add.text(0, 160, 'کد تخفیف خود را دریافت کنید', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Simple discount code box
    const codeBox = this.add.rectangle(0, 240, 300, 60, 0xf5f5f5);
    const codeText = this.add.text(0, 240, this.discountCode, {
      fontSize: '36px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Simple buttons
    const copyButton = this.add.rectangle(0, 320, 200, 50, 0x000000);
    const copyText = this.add.text(0, 320, 'کپی کد', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const restartButton = this.add.rectangle(0, 400, 200, 50, 0x000000);
    const restartText = this.add.text(0, 400, 'شروع دوباره', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Add everything to container
    container.add([congratsText, discountText, codeBox, codeText, 
                  copyButton, copyText, restartButton, restartText]);

    // Simple button interactions
    copyButton.setInteractive()
      .on('pointerdown', () => {
        navigator.clipboard.writeText(this.discountCode)
          .then(() => {
            copyText.setText('کد کپی شد');
            this.time.delayedCall(1000, () => {
              copyText.setText('کپی کد');
            });
          });
      })
      .on('pointerover', () => copyButton.setFillStyle(0x333333))
      .on('pointerout', () => copyButton.setFillStyle(0x000000));

    restartButton.setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'))
      .on('pointerover', () => restartButton.setFillStyle(0x333333))
      .on('pointerout', () => restartButton.setFillStyle(0x000000));
  }
}