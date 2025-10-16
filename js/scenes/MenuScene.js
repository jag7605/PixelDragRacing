import MenuUi from '../ui/MenuUi.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        //set registry
        if (this.registry.get('selectedCar') === undefined) {
            this.registry.set('selectedCar', 'beater_car');
        }

        if (this.registry.get('sfxMuted') === undefined) {
            this.registry.set('sfxMuted', false);
        }

        if (this.registry.get('musicMuted') === undefined) {
            this.registry.set('musicMuted', false);
        }

        const { width: W, height: H } = this.scale;

        //get player data
        let playerData = this.registry.get("playerData");

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
        ui.createButton(W/2 - 200, H - 140, 'btn_settings', 'SETTINGS', 0.55, 0.65, () => {
            this.scene.pause();
            this.scene.launch('SettingsScene');
        },);

        ui.createButton(W/2, H - 120, 'btn_start', 'START', 0.65, 0.75, () => {
        this.scene.start('RaceScene');
        }, 95);

        ui.createButton(W/2 + 200, H - 140, 'btn_garage', 'GARAGE', 0.45, 0.55, () => {
        this.scene.start('GarageScene');
        });

        // Info button
        ui.createButton(W - 40, 40, 'info', null, 0.3, 0.35, () => {
            this.scene.pause();
            this.scene.launch('InfoScene');
        });

        //login button
        ui.createButton(W - 110, 40, 'login', null, 0.37, 0.4, () => {
            this.scene.pause();
            if(playerData.username != 'Guest'){
                this.scene.launch('ProfileScene');
            }
            else{
                this.scene.launch('LoginScene');
            }
            
        });

        //display money
        this.add.image(30, 30, 'moneyIcon').setScale(0.03);
        this.add.bitmapText(70,  32, 'pixelFont', `$${playerData.currency.toString()}`, 24).setOrigin(0, 0.5);

        //diplay username at top when logged in
        this.add.bitmapText(640,  32, 'pixelFont', `Hello, ${playerData.username}`, 24).setOrigin(0.5);

  }
        
}
