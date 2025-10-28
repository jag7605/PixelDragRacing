// Imports for safe restarts
import RaceScene from './RaceScene.js';
import MenuScene from './MenuScene.js';
import TutorialRaceScene from './TutorialRaceScene.js';

// SAFE SCENE RESTART HELPER
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

export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {
        // Which race scene did we come from?
        const isTutorial = !!this.registry.get('tutorialMode');
        const raceKey = isTutorial ? 'TutorialRaceScene' : 'RaceScene';
        const RaceClass = isTutorial ? TutorialRaceScene : RaceScene;

        let raceScene = null;
        try { raceScene = this.scene.get(raceKey); } catch(e) {}

        // Background - solid black
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Get values from registry
        const youWin = this.registry.get('youWin');
        const finalTime = this.registry.get('finalTime');
        const zeroToHundredTime = this.registry.get('zeroToHundredTime');
        const topSpeed = this.registry.get('topSpeed');
        const resultText = this.registry.get('youWin');
        const botTime = this.registry.get('botTime');
        const perfectShifts = this.registry.get('perfectShifts');
        const shiftCount = this.registry.get('shiftCount');
        const perfectShiftPercent = this.registry.get('perfectShiftPercent');
        
        // Determine result
        let result;
        if (youWin) {
            result = 'YOU WIN!';
        } else {
            result = 'YOU LOSE!';
        }

        // Format times
        let displayFinalTime;
        if (finalTime === null) {
            displayFinalTime = 'DNF';
        } else {
            displayFinalTime = `${finalTime.toFixed(2)}s`;
        }

        let displayBotTime;
        if (botTime === null) {
            displayBotTime = 'DNF';
        } else {
            displayBotTime = `${botTime.toFixed(2)}s`;
        }

        // === DECORATIVE HEADER BOX ===
        const headerBox = this.add.graphics();
        headerBox.fillStyle(0x0a0a0a, 0.8);
        headerBox.fillRoundedRect(240, 40, 800, 140, 15);
        headerBox.lineStyle(3, youWin ? 0x4caf50 : 0xff5252, 1);
        headerBox.strokeRoundedRect(240, 40, 800, 140, 15);

        // Game Over text with glow effect
        const gameOverText = this.add.bitmapText(640, 80, 'pixelFont', 'RACE COMPLETE', 50)
            .setOrigin(0.5)
            .setTint(0xffffff);

        // Win/Lose text with color
        const resultColor = youWin ? 0x4caf50 : 0xff5252;
        const resultTextObj = this.add.bitmapText(640, 140, 'pixelFont', result, 45)
            .setOrigin(0.5)
            .setTint(resultColor);

        // === STATS CONTAINER ===
        const statsBox = this.add.graphics();
        statsBox.fillStyle(0x0a0a0a, 0.7);
        statsBox.fillRoundedRect(200, 210, 880, 300, 12);
        statsBox.lineStyle(2, 0x333333, 1);
        statsBox.strokeRoundedRect(200, 210, 880, 300, 12);

        // Section divider line
        const divider1 = this.add.graphics();
        divider1.lineStyle(1, 0x333333, 0.5);
        divider1.lineBetween(220, 360, 1060, 360);

        // Times section with icons/labels
        this.add.bitmapText(320, 240, 'pixelFont', 'YOUR TIME:', 24)
            .setOrigin(0, 0.5)
            .setTint(0xaaaaaa);
        this.add.bitmapText(960, 240, 'pixelFont', displayFinalTime, 28)
            .setOrigin(1, 0.5)
            .setTint(0xffffff);

        this.add.bitmapText(320, 285, 'pixelFont', 'OPPONENT TIME:', 24)
            .setOrigin(0, 0.5)
            .setTint(0xaaaaaa);
        this.add.bitmapText(960, 285, 'pixelFont', displayBotTime, 28)
            .setOrigin(1, 0.5)
            .setTint(0xffffff);

        this.add.bitmapText(320, 330, 'pixelFont', '0-100 TIME:', 24)
            .setOrigin(0, 0.5)
            .setTint(0xaaaaaa);
        const zeroHundredDisplay = zeroToHundredTime === null ? 'N/A' : `${zeroToHundredTime.toFixed(2)}s`;
        this.add.bitmapText(960, 330, 'pixelFont', zeroHundredDisplay, 28)
            .setOrigin(1, 0.5)
            .setTint(0xffffff);

        // Performance section
        this.add.bitmapText(320, 390, 'pixelFont', 'TOP SPEED:', 24)
            .setOrigin(0, 0.5)
            .setTint(0xaaaaaa);
        this.add.bitmapText(960, 390, 'pixelFont', `${topSpeed.toFixed(1)} KM/H`, 24)
            .setOrigin(1, 0.5)
            .setTint(0xffd54f);

        this.add.bitmapText(320, 445, 'pixelFont', 'PERFECT SHIFTS:', 24)
            .setOrigin(0, 0.5)
            .setTint(0xaaaaaa);
        const shiftColor = perfectShiftPercent >= 75 ? 0x4caf50 : perfectShiftPercent >= 50 ? 0xffd54f : 0xffffff;
        this.add.bitmapText(960, 445, 'pixelFont', `${perfectShifts}/${shiftCount}`, 24)
            .setOrigin(1, 0.5)
            .setTint(shiftColor);
        this.add.bitmapText(960, 470, 'pixelFont', `(${perfectShiftPercent}%)`, 20)
            .setOrigin(1, 0.5)
            .setTint(shiftColor);

        // === REWARDS SECTION ===
        const cashEarned = this.registry.get('summary_cashEarned') ?? 0;
        const xpEarned = this.registry.get('summary_xpEarned') ?? 0;
        const levelNow = this.registry.get('summary_level') ?? 1;
        const xpNow = this.registry.get('summary_xpNow') ?? 0;
        const xpNeeded = this.registry.get('summary_xpNeeded') ?? 200;
        const leveledUp = !!this.registry.get('summary_leveledUp');

        const rewardsBox = this.add.graphics();
        rewardsBox.fillStyle(0x0a0a0a, 0.7);
        rewardsBox.fillRoundedRect(200, 530, 880, 140, 12);
        rewardsBox.lineStyle(2, 0x4caf50, 0.8);
        rewardsBox.strokeRoundedRect(200, 530, 880, 140, 12);

        this.add.bitmapText(640, 550, 'pixelFont', 'REWARDS', 28)
            .setOrigin(0.5)
            .setTint(0x4caf50);

        this.add.bitmapText(320, 585, 'pixelFont', `CASH EARNED: $${cashEarned}`, 18)
            .setOrigin(0, 0.5)
            .setTint(0xffd54f);
        this.add.bitmapText(960, 585, 'pixelFont', `XP EARNED: +${xpEarned}`, 18)
            .setOrigin(1, 0.5)
            .setTint(0x4caf50);

        // XP Progress bar with styled container
        const barW = 600, barH = 24, barX = 640, barY = 630;
        
        // Bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1a1a1a, 1);
        barBg.fillRoundedRect(barX - barW/2, barY - barH/2, barW, barH, 8);
        barBg.lineStyle(2, 0x333333, 1);
        barBg.strokeRoundedRect(barX - barW/2, barY - barH/2, barW, barH, 8);

        // Progress fill
        const pct = Math.min(1, xpNow / xpNeeded);
        const progressBar = this.add.graphics();
        progressBar.fillStyle(0x4caf50, 1);
        progressBar.fillRoundedRect(barX - barW/2 + 2, barY - barH/2 + 2, (barW - 4) * pct, barH - 4, 6);

        // XP text on bar
        this.add.bitmapText(barX, barY, 'pixelFont', `${xpNow}/${xpNeeded} XP`, 16)
            .setOrigin(0.5)
            .setTint(0xffffff)
            .setDepth(1);

        // Level up notification
        if (leveledUp) {
            const levelUpBox = this.add.graphics();
            levelUpBox.fillStyle(0xffd54f, 0.2);
            levelUpBox.fillRoundedRect(490, 680, 300, 35, 8);
            levelUpBox.lineStyle(2, 0xffd54f, 1);
            levelUpBox.strokeRoundedRect(490, 680, 300, 35, 8);

            this.add.bitmapText(640, 698, 'pixelFont', '★ LEVEL UP! ★', 20)
                .setOrigin(0.5)
                .setTint(0xffd54f);
        }

        // === BUTTONS ===
        // Restart button
        const restartContainer = this.add.container(340, 710).setSize(220, 50).setInteractive();
        
        const restartBg = this.add.graphics();
        restartBg.fillStyle(0x4caf50, 1);
        restartBg.fillRoundedRect(-110, -25, 220, 50, 10);
        restartBg.lineStyle(2, 0x66bb6a, 1);
        restartBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        restartContainer.add(restartBg);

        const restartText = this.add.bitmapText(0, 0, 'pixelFont', 'RESTART', 20)
            .setOrigin(0.5)
            .setTint(0xffffff);
        restartContainer.add(restartText);

        restartContainer.on('pointerover', () => {
            restartBg.clear();
            restartBg.fillStyle(0x66bb6a, 1);
            restartBg.fillRoundedRect(-110, -25, 220, 50, 10);
            restartBg.lineStyle(2, 0x81c784, 1);
            restartBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        });
        
        restartContainer.on('pointerout', () => {
            restartBg.clear();
            restartBg.fillStyle(0x4caf50, 1);
            restartBg.fillRoundedRect(-110, -25, 220, 50, 10);
            restartBg.lineStyle(2, 0x66bb6a, 1);
            restartBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        });

        restartContainer.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            raceScene?.bgMusic?.stop?.();
            raceScene?.bgMusic?.destroy?.();
            if (isTutorial) {
                raceScene?.setTutorialFrozen?.(false);
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                raceScene.resetRace();
                safeStartScene(this, raceKey, RaceClass);
                this.scene.stop();
            });
        });

        // Main Menu button
        const menuContainer = this.add.container(940, 710).setSize(220, 50).setInteractive();
        
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x333333, 1);
        menuBg.fillRoundedRect(-110, -25, 220, 50, 10);
        menuBg.lineStyle(2, 0x555555, 1);
        menuBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        menuContainer.add(menuBg);

        const menuText = this.add.bitmapText(0, 0, 'pixelFont', 'MAIN MENU', 20)
            .setOrigin(0.5)
            .setTint(0xffffff);
        menuContainer.add(menuText);

        menuContainer.on('pointerover', () => {
            menuBg.clear();
            menuBg.fillStyle(0x555555, 1);
            menuBg.fillRoundedRect(-110, -25, 220, 50, 10);
            menuBg.lineStyle(2, 0x777777, 1);
            menuBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        });
        
        menuContainer.on('pointerout', () => {
            menuBg.clear();
            menuBg.fillStyle(0x333333, 1);
            menuBg.fillRoundedRect(-110, -25, 220, 50, 10);
            menuBg.lineStyle(2, 0x555555, 1);
            menuBg.strokeRoundedRect(-110, -25, 220, 50, 10);
        });

        menuContainer.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            raceScene?.bgMusic?.stop?.();
            raceScene?.bgMusic?.destroy?.();
            if (isTutorial) {
                raceScene?.setTutorialFrozen?.(false);
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                safeStartScene(this, 'MenuScene', MenuScene);
                this.scene.stop();
            });
        });

        if (isTutorial) {
            restartContainer.setVisible(false).disableInteractive();
            menuContainer.x = 640;
        }

        // === Shift everything up slightly ===
        const SHIFT_UP = 20;
        this.children.each(child => { child.y -= SHIFT_UP; });
    }  
}