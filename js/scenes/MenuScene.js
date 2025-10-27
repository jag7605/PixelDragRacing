import MenuUi from '../ui/MenuUi.js';
import { savePlayerDataFromScene } from '../utils/playerData.js';
import ModeSelection from '../ui/ModeSelection.js';

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
        this.add.image(W / 2, H / 2, 'sky').setDisplaySize(W, H);
        this.add.image(W / 2, H - 100, 'road').setDisplaySize(W, 200);

        // Logo
        const logo = this.add.image(W / 2, 250, 'gameLogo').setOrigin(0.5);
        const maxLogoWidth = W * 0.75;
        const scale = Math.min(maxLogoWidth / logo.width, 1);
        logo.setScale(0.5);

        // Clouds
        this.add.image(W / 2 - 390, 150, 'cloud').setScale(0.27);
        this.add.image(W / 2 + 268, 320, 'cloud').setScale(0.22);
        this.add.image(W / 2 + 340, 120, 'cloud').setScale(0.3);
        this.add.image(W / 2 - 300, 360, 'cloud').setScale(0.25);

        // UI helper
        const ui = new MenuUi(this);

        // Buttons
        ui.createButton(W / 2 - 200, H - 140, 'btn_settings', 'SETTINGS', 0.55, 0.65, () => {
            this.scene.pause();
            this.scene.launch('SettingsScene');
        },);

        ui.createButton(W / 2, H - 120, 'btn_start', 'START', 0.65, 0.75, () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            //Remove the button so it doesn't block overlay input
            if (this.startButton) {
                this.startButton.disableInteractive();
                this.startButton.destroy();
                this.startButton = null;
            }

            //show mode selection overlay
            ModeSelection.showModeSelection(this, (mode) => {
                this.registry.set('raceMode', mode);

                //difficulty
                ModeSelection.showDifficultySelection(this, (botSkill) => {
                    this.registry.set('botSkill', botSkill);

                    //track length
                    ModeSelection.showTrackLengthSelection(this, (trackLength) => {
                        this.registry.set('trackLength', trackLength);

                        this.scene.start('RaceScene');
                    });
                });
            });
        }, 95);

        ui.createButton(W / 2 + 200, H - 140, 'btn_garage', 'GARAGE', 0.45, 0.55, () => {
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
            if (playerData.username != 'Guest') {
                this.scene.launch('ProfileScene');
            }
            else {
                this.scene.launch('LoginScene');
            }

        });

        //stats button
        ui.createButton(W - 180, 40, 'stats', null, 0.3, 0.35, () => {
            this.scene.pause();
            this.scene.launch('StatsScene');
        });

        //display money
        this.add.image(30, 30, 'moneyIcon').setScale(0.03);
        this.moneyText = this.add.bitmapText(70, 32, 'pixelFont', `$${playerData.currency.toString()}`, 24).setOrigin(0, 0.5);

        //display level
        this.levelText = this.add.bitmapText(90, 70, 'pixelFont', `Level: ${playerData.level}`, 20).setOrigin(0.5);

        //diplay username at top when logged in
        this.add.bitmapText(640, 32, 'pixelFont', `Hello, ${playerData.username}`, 24).setOrigin(0.5);

        const levelButton = this.add.bitmapText(20, 110, 'pixelFont', 'add level', 10).setInteractive();
        levelButton.on('pointerover', () => levelButton.setTint(0x888888));
        levelButton.on('pointerout', () => levelButton.clearTint());
        levelButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            playerData.level += 1;
            this.levelText.destroy();
            this.levelText = this.add.bitmapText(90, 70, 'pixelFont', `Level: ${playerData.level}`, 20).setOrigin(0.5);
            this.registry.set("playerData", playerData);
            savePlayerDataFromScene(this);
        });

        const moneyButton = this.add.bitmapText(20, 130, 'pixelFont', 'add money', 10).setInteractive();
        moneyButton.on('pointerover', () => moneyButton.setTint(0x888888));
        moneyButton.on('pointerout', () => moneyButton.clearTint());
        moneyButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            playerData.currency += 100;
            this.moneyText.destroy();
            this.moneyText = this.add.bitmapText(70, 20, 'pixelFont', `$${playerData.currency}`, 20).setOrigin(0, 0);
            this.registry.set("playerData", playerData);
            savePlayerDataFromScene(this);
        });

    }

}
