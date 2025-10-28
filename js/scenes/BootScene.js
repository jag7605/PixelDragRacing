export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Backgrounds
    this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
    this.load.image('road', 'assets/backgrounds/Road_tile.webp');
    this.load.image('finishLine', 'assets/backgrounds/Finish_Line.png');
    this.load.image('cloud', 'assets/backgrounds/pixel_cloud.png');
    this.load.image('garage_bg', 'assets/backgrounds/garage_bg.png'); 
    this.load.image('sky_night', 'assets/backgrounds/Night.webp');
    this.load.image('sky_day', 'assets/backgrounds/Day.webp');    


    // Logo
    this.load.image('gameLogo', 'assets/ui//gamelogo/PDRlogo.png');

    // Cars
    this.load.spritesheet('beater_jeep', 'assets/cars/beater_jeep_ride.png', { frameWidth: 256, frameHeight: 86 });
    this.load.spritesheet('trollcar_white', 'assets/cars/troll.png', { frameWidth: 256, frameHeight: 200 });

    //body gt40
    this.load.spritesheet('gt40_black', 'assets/cars/car_body/gt40_black.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('gt40_blue', 'assets/cars/car_body/gt40_blue.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('gt40_white', 'assets/cars/car_body/gt40.png', { frameWidth: 112, frameHeight: 64 });

    //porsche body
    this.load.spritesheet('porsche_red_white', 'assets/cars/car_body/porsche_red_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('porsche_white', 'assets/cars/car_body/porsche_white.png', { frameWidth: 112, frameHeight: 64 });

    //ferrari body
    this.load.spritesheet('ferrari_white', 'assets/cars/car_body/ferrari_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('ferrari_red', 'assets/cars/car_body/ferrari_red.png', { frameWidth: 112, frameHeight: 64 });

    //nissan body
    this.load.spritesheet('nissan_blue', 'assets/cars/car_body/nissan_blue.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('nissan_white', 'assets/cars/car_body/nissan_white.png', { frameWidth: 112, frameHeight: 64 });

    //golf body
    this.load.spritesheet('golf_white', 'assets/cars/car_body/golf_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('golf_green', 'assets/cars/car_body/golf_green.png', { frameWidth: 112, frameHeight: 64 });

    //mustang body
    this.load.spritesheet('mustang_white', 'assets/cars/car_body/mustang_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('mustang_blue', 'assets/cars/car_body/mustang_blue.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('mustang_black', 'assets/cars/car_body/mustang_black.png', { frameWidth: 112, frameHeight: 64 });

    //lamborghini body
    this.load.spritesheet('lamborghini_white', 'assets/cars/car_body/lamborghini_white.png', { frameWidth: 112, frameHeight: 64 });
    this.load.spritesheet('lamborghini_yellow', 'assets/cars/car_body/lamborghini_yellow.png', { frameWidth: 112, frameHeight: 64 });


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
    this.load.image('dayIcon', 'assets/ui/buttonImages/Sun.webp');
    this.load.image('nightIcon', 'assets/ui/buttonImages/Moon.webp');
    this.load.image('stats', 'assets/ui/buttonImages/stats.png');


    // Sounds
    this.load.audio('buttonSound', 'assets/sound/button_click.mp3');
    this.load.audio('hoverSound', 'assets/sound/hover_button.mp3');
    this.load.audio('bgMusic1', 'assets/sound/bgMusic.mp3');
    this.load.audio('bgMusic2', 'assets/sound/bgMusic2.mp3');
    this.load.audio('bgMusic3', 'assets/sound/bgMusic3.mp3');
    this.load.audio('redBeep', 'assets/sound/RedBeep.mp3');
    this.load.audio('goBeep', 'assets/sound/GoBeep.mp3');
   
    //Racing sfx
    this.load.audio('sfx_accelerate', 'assets/sound/sfx_accelerate.mp3');
    this.load.audio('sfx_gear_shift', 'assets/sound/sfx_gear_shift.mp3');
    this.load.audio('sfx_nitrous', 'assets/sound/sfx_nitrous.mp3');
    this.load.audio('sfx_perfect_shift', 'assets/sound/sfx_perfect_shift.mp3'); 
    this.load.audio('sfx_idle', 'assets/sound/sfx_idle.mp3');


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

  this.registry.set('cars', [
      {
          key: 'ferrari', scale: 1.8, wheelScale: 0.93, wheelX: 1, wheelY: -6, y: 80, cost: 0, level: 1, stage: 1, maxStage: 3, bodies: [
              { key: 'ferrari_white', name: 'white', cost: 0 },
              { key: 'ferrari_red', name: 'red', cost: 0 }
          ],
      },
      {
          key: 'gt40', scale: 1.8, wheelScale: 1, wheelX: 0, wheelY: 0, y: 80, cost: 100, level: 1, stage: 1, maxStage: 3, bodies: [
              { key: 'gt40_white', name: 'Classic', cost: 0 },
              { key: 'gt40_black', name: 'Black', cost: 0 },
              { key: 'gt40_blue', name: 'Blue', cost: 0 }
          ],
      },
      {
          key: 'golf', scale: 1.8, wheelScale: 1, wheelX: 0, wheelY: 2, y: 80, cost: 300, level: 2, stage: 1, maxStage: 3, bodies: [
              { key: 'golf_white', name: 'Classic', cost: 0 },
              { key: 'golf_green', name: 'Green', cost: 0 }
          ],
      },
      {
          key: 'porsche', scale: 1.8, wheelScale: 0.86, wheelX: 5, wheelY: 0, y: 80, cost: 500, level: 2, stage: 1, maxStage: 3, bodies: [
              { key: 'porsche_red_white', name: 'Classic', cost: 0 },
              { key: 'porsche_white', name: 'Black', cost: 0 }
          ],
      },
      {
          key: 'nissan', scale: 1.6, wheelScale: 0.92, wheelX: 2, wheelY: 10, y: 80, cost: 800, level: 3, stage: 1, maxStage: 3, bodies: [
              { key: 'nissan_blue', name: 'grey', cost: 0 },
              { key: 'nissan_white', name: 'yellow', cost: 0 }
          ],
      },
      {
          key: 'mustang', scale: 1.8, wheelScale: 0.93, wheelX: 3, wheelY: 0, y: 80, cost: 900, level: 3, stage: 1, maxStage: 3, bodies: [
              { key: 'mustang_white', name: 'Classic', cost: 0 },
              { key: 'mustang_black', name: 'Black', cost: 0 },
              { key: 'mustang_blue', name: 'Blue', cost: 0 }
          ],
      },
      {
          key: 'lamborghini', scale: 1.8, wheelScale: 0.97, wheelX: 3.5, wheelY: 0, y: 80, cost: 1000, level: 4, stage: 1, maxStage: 3, bodies: [
              { key: 'lamborghini_white', name: 'Classic', cost: 0 },
              { key: 'lamborghini_yellow', name: 'yellow', cost: 0 }
          ],
      },
      {
          key: 'trollcar', scale: 0.8, y: 50, cost: 1500, level: 5, stage: 1, maxStage: 3, hasWheels: false, bodies: [
              { key: 'trollcar_white', name: 'Troll', cost: 0 }
          ]
      },
  ]);
    this.registry.set('wheels', [
          { key: 'wheels', scale: 1.6, y: 80, cost: 0, level: 1 },
          { key: 'wheel1', scale: 1.6, y: 80, cost: 0, level: 1 },
          { key: 'wheel2', scale: 1.6, y: 80, cost: 0, level: 1 },
          { key: 'wheel3', scale: 1.6, y: 80, cost: 0, level: 1 },
          { key: 'wheel4', scale: 1.6, y: 80, cost: 0, level: 1 },
      ]
  );

    this.load.once('complete', () => {
      //full size growth when it is finshed 
      this.tweens.add({
        targets: logo,
        scaleX: 0.7,
        scaleY: 0.7,
        duration: 800,
        ease: 'Back.Out',
        onComplete: () => this.scene.start('MenuScene'), 
      });
    });
      
    this.load.start();
  }
}
