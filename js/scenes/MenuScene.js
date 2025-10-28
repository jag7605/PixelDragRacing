import MenuUi from '../ui/MenuUi.js';
import { savePlayerDataFromScene } from '../utils/playerData.js';
import ModeSelection from '../ui/ModeSelection.js';
import { xpForLevel } from '../utils/xp.js';

// Import scenes to safely restart them
import GarageScene from './GarageScene.js';
import RaceScene from './RaceScene.js';

// ——— SAFE SCENE RESTART HELPER ———
// this function fixes a bug where restarting a scene that was shutdown causes errors (eg exiting race before completion then trying to go to garage)
function safeStartScene(currentScene, sceneKey, SceneClass) {
    const sm = currentScene.scene;
    const existing = sm.get(sceneKey);
    if (existing && existing.sys?.settings?.status === Phaser.Scene.SHUTDOWN) {
        sm.remove(sceneKey);
    }
    if (!sm.get(sceneKey)) {
        sm.add(sceneKey, SceneClass, false);
    }
    sm.start(sceneKey);
}

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Set registry defaults
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
        let playerData = this.registry.get("playerData");

        // Background
        this.add.image(W / 2, H / 2, 'sky_night').setDisplaySize(W, H); // changed background to night for menu
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

        // SETTINGS BUTTON
        ui.createButton(W / 2 - 200, H - 140, 'btn_settings', 'SETTINGS', 0.55, 0.65, () => {
            this.scene.pause();
            this.scene.launch('SettingsScene');
        });

        // START BUTTON (with Mode Selection flow)
        ui.createButton(W / 2, H - 120, 'btn_start', 'START', 0.65, 0.75, () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            if (this.startButton) {
                this.startButton.disableInteractive();
                this.startButton.destroy();
                this.startButton = null;
            }

            ModeSelection.showModeSelection(this, (mode) => {
                this.registry.set('raceMode', mode);

                ModeSelection.showDifficultySelection(this, (botSkill) => {
                    this.registry.set('botSkill', botSkill);

                    ModeSelection.showTrackLengthSelection(this, (trackLength) => {
                        this.registry.set('trackLength', trackLength);
                        this.registry.set('tutorialMode', false);

                        // SAFE RESTART RACE SCENE
                        safeStartScene(this, 'RaceScene', RaceScene);
                    });
                });
            });
        }, 95);

        // GARAGE BUTTON
        ui.createButton(W / 2 + 200, H - 140, 'btn_garage', 'GARAGE', 0.45, 0.55, () => {
            safeStartScene(this, 'GarageScene', GarageScene);
        });

        // INFO BUTTON
        ui.createButton(W - 40, 40, 'info', null, 0.3, 0.35, () => {
            this.scene.pause();
            this.scene.launch('InfoScene');
        });

        // LOGIN / PROFILE BUTTON
        ui.createButton(W - 110, 40, 'login', null, 0.37, 0.4, () => {
            this.scene.pause();
            if (playerData.username !== 'Guest') {
                this.scene.launch('ProfileScene');
            } else {
                this.scene.launch('LoginScene');
            }
        });

        // STATS BUTTON
        ui.createButton(W - 180, 40, 'stats', null, 0.3, 0.35, () => {
            this.scene.pause();
            this.scene.launch('StatsScene');
        });

        // DISPLAY MONEY
        this.add.image(30, 30, 'moneyIcon').setScale(0.03);
        this.moneyText = this.add.bitmapText(70, 32, 'pixelFont', `$${playerData.currency.toString()}`, 24).setOrigin(0, 0.5);

        // DISPLAY LEVEL
        this.add.bitmapText(15, 80, 'pixelFont', `Level ${playerData.level}`, 20).setOrigin(0, 0.5);

        // LEVEL PROGRESS BAR
        const barWidth = 200;
        const barHeight = 20;
        const barX = 15;
        const barY = 110;

        const progressBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x555555).setOrigin(0, 0.5);
        const progressBarFill = this.add.rectangle(barX, barY, 0, barHeight, 0x068f06).setOrigin(0, 0.5);

        const need = xpForLevel(playerData.level);
        const prog = Phaser.Math.Clamp(playerData.XP / need, 0, 1);
        progressBarFill.width = barWidth * prog;

        this.add.bitmapText(barX + barWidth / 2, barY, 'pixelFont', `${playerData.XP} / ${need} XP`, 14).setOrigin(0.5);

        // USERNAME
        this.add.bitmapText(640, 32, 'pixelFont', `Hello, ${playerData.username}`, 24).setOrigin(0.5);

        // DEV: Add Level Button
        const levelButton = this.add.bitmapText(20, 130, 'pixelFont', 'add level', 10).setInteractive();
        levelButton.on('pointerover', () => levelButton.setTint(0x888888));
        levelButton.on('pointerout', () => levelButton.clearTint());
        levelButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            playerData.level += 1;
            this.registry.set("playerData", playerData);
            savePlayerDataFromScene(this);
            this.scene.restart();
        });

        // DEV: Add Money Button
        const moneyButton = this.add.bitmapText(20, 150, 'pixelFont', 'add money', 10).setInteractive();
        moneyButton.on('pointerover', () => moneyButton.setTint(0x888888));
        moneyButton.on('pointerout', () => moneyButton.clearTint());
        moneyButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            playerData.currency += 100;
            this.moneyText.destroy();
            this.moneyText = this.add.bitmapText(70, 32, 'pixelFont', `$${playerData.currency}`, 24).setOrigin(0, 0.5);
            this.registry.set("playerData", playerData);
            savePlayerDataFromScene(this);
        });
    }
}