export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Backgrounds
    this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
    this.load.image('road', 'assets/backgrounds/road_tile_256px.png');
    this.load.image('finishLine', 'assets/backgrounds/Finish_Line.png');
    this.load.image('cloud', 'assets/backgrounds/pixel_cloud.png');
    this.load.image('garage_bg', 'assets/backgrounds/garage_bg.png');     


    // Logo
    this.load.image('gameLogo', 'assets/ui//gamelogo/PDRlogo.png');

    // Cars
    this.load.spritesheet('beater_jeep', 'assets/cars/beater_jeep_ride.png', { frameWidth: 256, frameHeight: 86 });

    //body gt40
    this.load.spritesheet('gt40_black', 'assets/cars/car_body/gt40_black.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('gt40_blue', 'assets/cars/car_body/gt40_blue.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('gt40', 'assets/cars/car_body/gt40.png', { frameWidth: 112, frameHeight: 64 });

    //porsche body
    this.load.spritesheet('porsche_red_white', 'assets/cars/car_body/porsche_red_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('porsche_white', 'assets/cars/car_body/porsche_white.png', { frameWidth: 112, frameHeight: 64 });

    //ferrari body
    this.load.spritesheet('ferrari_white', 'assets/cars/car_body/ferrari_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('ferrari_red', 'assets/cars/car_body/ferrari_red.png', { frameWidth: 112, frameHeight: 64 });

    //nissan body
    this.load.spritesheet('nissan_blue', 'assets/cars/car_body/nissan_blue.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('nissan_white', 'assets/cars/car_body/nissan_white.png', { frameWidth: 112, frameHeight: 64 });

    //wheels
    this.load.spritesheet('wheels', 'assets/cars/car_wheel/wheels.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('wheel1', 'assets/cars/car_wheel/wheel1.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('wheel2', 'assets/cars/car_wheel/wheel2.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('wheel3', 'assets/cars/car_wheel/wheel3.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('wheel4', 'assets/cars/car_wheel/wheel4.png', { frameWidth: 112, frameHeight: 64 });

    //wheel images
    this.load.image('wheels_display', 'assets/cars/car_wheel/spr_wheel_type1.png');
    this.load.image('wheel1_display', 'assets/cars/car_wheel/spr_wheel_type2.png');
    this.load.image('wheel2_display', 'assets/cars/car_wheel/spr_wheel_type3.png');
    this.load.image('wheel3_display', 'assets/cars/car_wheel/spr_wheel_type4.png');
    this.load.image('wheel4_display', 'assets/cars/car_wheel/spr_wheel_type5.png');
    
    // UI
    this.load.image('yellowSquare', 'assets/ui/yellowSquare.png');
    this.load.image('title', 'assets/ui/title.png');
    this.load.bitmapFont('pixelFont', 'assets/ui/font/font.png', 'assets/ui/font/font.xml');
    this.load.image('moneyIcon', 'assets/ui/dollar.png');
    this.load.image('greySquare', 'assets/ui/greySquare.png');
    this.load.image('box', 'assets/ui/box.png');
    this.load.image('check', 'assets/ui/check.png');

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
    this.load.image('arrow', 'assets/ui/buttonImages/arrow.png');
    this.load.image('select', 'assets/ui/buttonImages/select.png');

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

    if (!this.registry.get('selectedCar')) {
      this.registry.set('selectedCar', 'ferrari');
    }

    if (!this.registry.get('wheelScale')) {
      this.registry.set('wheelScale', 0.73);
    }

    if (!this.registry.get('selectedWheel')) {
      this.registry.set('selectedWheel', 'wheels');
    }

    if (this.registry.get('selectedBody') === undefined) {
            this.registry.set('selectedBody', 'ferrari_white');
        }

    this.registry.set('selectedCarData', {
        body: 'ferrari_white',
        wheels: 'wheels',
        type: 'ferrari',
        stage: 1
    });

    // Get current player data
    let playerData = this.registry.get("playerData");

        if (!playerData) {
            // Create temporary guest player
            playerData = {
                username: "Guest",
                currency: 0,      // starting money for this session
                unlockedCars: { ferrari: 1 }, // default cars
                stats: { races: 0, wins: 0, losses: 0, totalShifts: 0, shifts: 0 },
                XP: 0,
                level: 1,
                totalCurrencyEarned: 0,
                fastestTime: 0
            };
            this.registry.set("playerData", playerData);
        }
  
    //set upgrade registry if not set based on unlocked cars
    if (!this.registry.get('upgrades')) {
      const upgrades = {};
      for (const carKey in playerData.unlockedCars) {
          if (playerData.unlockedCars.hasOwnProperty(carKey)) {
              upgrades[carKey] = playerData.unlockedCars[carKey];
          }
      }
      this.registry.set('upgrades', upgrades);
  }


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
