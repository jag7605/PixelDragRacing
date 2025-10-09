export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Backgrounds
    this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
    this.load.image('road', 'assets/backgrounds/road_tile_256px.png');
    this.load.image('finishLine', 'assets/backgrounds/Finish_Line.png');
    this.load.image('cloud', 'assets/backgrounds/pixel_cloud.png');
    this.load.image('garage_bg', 'assets/backgrounds/garage_bg.jpg');       // clear
    this.load.image('garage_bg_blur', 'assets/backgrounds/garage_bg_blur.jpg'); // blurred


    // Logo
    this.load.image('gameLogo', 'assets/ui//gamelogo/PDRlogo.png');

    // Cars
    this.load.spritesheet('beater_car', 'assets/cars/beater_car_ride.png', { frameWidth: 192, frameHeight: 192 });
    this.load.spritesheet('beater_jeep', 'assets/cars/beater_jeep_ride.png', { frameWidth: 256, frameHeight: 256 });

    // UI
    this.load.image('yellowSquare', 'assets/ui/yellowSquare.png');
    this.load.image('title', 'assets/ui/title.png');
    this.load.bitmapFont('pixelFont', 'assets/ui/font/font.png', 'assets/ui/font/font.xml');
    this.load.image('moneyIcon', 'assets/ui/dollar.png');

    //buttons
    this.load.image('btn_start', 'assets/ui/buttonImages/play2.png');
    this.load.image('menu', 'assets/ui/buttonImages/menu.png');
    this.load.image('replay', 'assets/ui/buttonImages/replay2.png');
    this.load.image('music', 'assets/ui/buttonImages/music.png');
    this.load.image('sound', 'assets/ui/buttonImages/sound.png');
    this.load.image('btn_garage', 'assets/ui/buttonImages/shop.png');
    this.load.image('btn_resume', 'assets/ui/resume.png');
    this.load.image('info', 'assets/ui/buttonImages/info.png');
    this.load.image('btn_settings', 'assets/ui/buttonImages/settings.png');
    this.load.image('pauseButton', 'assets/ui/buttonImages/pause2.png');
    this.load.image('login', 'assets/ui/buttonImages/login.png');

    // Sounds
    this.load.audio('buttonSound', 'assets/sound/button_click.mp3');
    this.load.audio('hoverSound', 'assets/sound/hover_button.mp3');
    this.load.audio('bgMusic1', 'assets/sound/bgMusic.mp3');
    this.load.audio('bgMusic2', 'assets/sound/bgMusic2.mp3');
    this.load.audio('bgMusic3', 'assets/sound/bgMusic3.mp3');
    this.load.audio('redBeep', 'assets/sound/RedBeep.mp3');
    this.load.audio('goBeep', 'assets/sound/GoBeep.mp3');

    // Speedometer/Gauges
    this.load.image('rpmDial', 'assets/Speedometer/RPM.png');
    this.load.image('mphDial', 'assets/Speedometer/MPH.png');
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Add the logo collapsed vertically
    const logo = this.add.image(W / 2, H / 2, 'gameLogo')
    .setOrigin(0.5, 0.5)
    .setScale(0.5, 0.001);


    //smooth growing logo animation
    this.load.on('progress', (p) => {
      const targetScaleY = 0.6 * p; // scale out from center
      this.tweens.add({
        targets: logo,
        scaleY: targetScaleY,
        duration: 500,     // how slow it grows
        ease: 'Sine.easeOut'
      });
    });

    this.load.once('complete', () => {
      //full size growth when it is finshed 
      this.tweens.add({
        targets: logo,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 800,
        ease: 'Back.Out',
        onComplete: () => this.scene.start('DevSceneSwitch'), 
      });
    });

    this.load.start();
  }
}
