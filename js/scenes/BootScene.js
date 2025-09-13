export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    this.cameras.main.setBackgroundColor('#151822');
    //load only the logo
    this.load.image('gameLogo', 'assets/ui/gamelogo/PDRlogo.png');
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Add the logo collapsed vertically
    const logo = this.add.image(W / 2, H * 0.65, 'gameLogo')
    .setOrigin(0.5, 1)
    .setScale(0.35, 0.001);


    //smooth growing logo animation
    let currentScaleY = 0.001;

    this.load.on('progress', (p) => {
      const targetScaleY = 0.35 * p; // final height at 50% scale
      this.tweens.add({
        targets: logo,
        scaleY: targetScaleY,
        duration: 700,     // how slow it grows
        ease: 'Sine.easeOut'
      });
    });

    this.load.once('complete', () => {
      //full size growth when it is finshed 
      this.tweens.add({
        targets: logo,
        scaleY: 0.35,
        duration: 700,
        ease: 'Sine.easeOut',
        onComplete: () => this.scene.start('MenuScene')
      });
    });

    //load everything
    this.load.image('sky',  'assets/backgrounds/sky_day_1440x1080.png');
    this.load.image('road', 'assets/backgrounds/road_tile_256px.png');

    this.load.image('btn_start',    'assets/ui/buttonImages/play2.png');
    this.load.image('btn_settings', 'assets/ui/buttonImages/settings2.png');
    this.load.image('btn_garage',   'assets/ui/buttonImages/shop.png');

    this.load.bitmapFont('pixelFont', 'assets/ui/font/font.png', 'assets/ui/font/font.xml');

    this.load.start();
  }
}
