import MenuUi from '../ui/MenuUi.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Background
        this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
        this.load.image('road', 'assets/backgrounds/road_tile_256px.png');

        //Logo
        this.load.image('gameLogo', 'assets/ui/gameLogo/PDRlogo.png'); 

        //Buttons
        this.load.image('btn_start',    'assets/ui/buttonImages/play2.png');
        this.load.image('btn_settings', 'assets/ui/buttonImages/settings2.png');
        this.load.image('btn_garage',   'assets/ui/buttonImages/shop.png');

        // Pixel font
        this.load.bitmapFont('pixelFont', 'assets/ui/font/font.png', 'assets/ui/font/font.xml');

        //cloud
        this.load.image('cloud', 'assets/backgrounds/pixel_cloud.png');
    }

    create() {

        const { width: W, height: H } = this.scale;

         // Background
        this.add.image(W/2, H/2, 'sky').setDisplaySize(W, H);
        this.add.image(W/2, H - 100, 'road').setDisplaySize(W, 200);

        // Logo
        const logo = this.add.image(W/2, 250, 'gameLogo').setOrigin(0.5);
        const maxLogoWidth = W * 0.75;
        const scale = Math.min(maxLogoWidth / logo.width, 1);
        logo.setScale(0.5); 

        // Clouds
        this.add.image(W/2 - 390, 150, 'cloud').setScale(0.27); 
        this.add.image(W/2 + 268, 320, 'cloud').setScale(0.22); 
        this.add.image(W/2 + 340, 120, 'cloud').setScale(0.3);      
        this.add.image(W/2 - 300, 360, 'cloud').setScale(0.25);    

        // UI helper
        const ui = new MenuUi(this);

        // Buttons
        ui.createButton(W/2 - 200, H - 140, 'btn_settings', 'SETTINGS', 0.45, 0.55, () => {
        this.scene.start('SettingsScene');
        },);

        ui.createButton(W/2, H - 120, 'btn_start', 'START', 0.65, 0.75, () => {
        this.scene.start('RaceScene');
        }, 95);

        ui.createButton(W/2 + 200, H - 140, 'btn_garage', 'GARAGE', 0.45, 0.55, () => {
        this.scene.start('GarageScene');
        });

  }

        
}
