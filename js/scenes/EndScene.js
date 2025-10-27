export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {

        // Which race scene did we come from?
        const isTutorial = !!this.registry.get('tutorialMode');
        const raceKey = isTutorial ? 'TutorialRaceScene' : 'RaceScene';

        // May or may not be running now; that’s fine, guard accesses with ?.
        let raceScene = null;
        try { raceScene = this.scene.get(raceKey); } catch(e) {}

        //add black background
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        //get values from registry
        const youWin = this.registry.get('youWin');
        const finalTime = this.registry.get('finalTime');
        const zeroToHundredTime = this.registry.get('zeroToHundredTime');
        const topSpeed = this.registry.get('topSpeed');
        const resultText = this.registry.get('youWin');
        const botTime = this.registry.get('botTime');
        const perfectShifts = this.registry.get('perfectShifts');
        const shiftCount = this.registry.get('shiftCount');
        const perfectShiftPercent = this.registry.get('perfectShiftPercent');
        
        //check if player won or lost
        let result;
        if (youWin) {
            result = 'YOU WIN!';
        } else {
            result = 'YOU LOSE!';
        }

        //if finalTime is null display DNF for finish time
        let displayFinalTime;
        if (finalTime === null) {
            displayFinalTime = 'DNF';
        } else {
            displayFinalTime = `${finalTime.toFixed(2)}s`;
        }

        //if botTime is null display DNF for bot time
        let displayBotTime;
        if (botTime === null) {
            displayBotTime = 'DNF';
        } else {
            displayBotTime = `${botTime.toFixed(2)}s`;
        }

        //add game over text
        this.add.bitmapText(640, 120, 'pixelFont', 'GAME OVER', 60).setOrigin(0.5);

        //you win or you lose text
        this.add.bitmapText(640, 200, 'pixelFont', result, 50).setOrigin(0.5);

        //display final time
        this.add.bitmapText(640, 280, 'pixelFont', `Your Time: ${displayFinalTime}`, 30).setOrigin(0.5);

        //bot time
        this.add.bitmapText(640, 340, 'pixelFont', `Opponent Time: ${displayBotTime}`, 30).setOrigin(0.5);

        //0-100 time
        //if zeroToHundredTime is null display N/A
        if (zeroToHundredTime === null) {
            this.add.bitmapText(640, 400, 'pixelFont', `0-100 Time: N/A`, 30).setOrigin(0.5);
        } else {
            this.add.bitmapText(640, 400, 'pixelFont', `0-100 Time: ${zeroToHundredTime.toFixed(2)}s`, 30).setOrigin(0.5);
        }

        //top speed
        this.add.bitmapText(640, 440, 'pixelFont', `Top Speed: ${topSpeed.toFixed(1)} km/h`, 30).setOrigin(0.5);

        //perfect shifts
        this.add.bitmapText(640, 500, 'pixelFont', 
            `Perfect Shifts: ${perfectShifts} / ${shiftCount} (${perfectShiftPercent}%)`, 
            30
        ).setOrigin(0.5);

        //EXPANDED SUMMARY UI 
        const cashEarned   = this.registry.get('summary_cashEarned') ?? 0;
        const xpEarned     = this.registry.get('summary_xpEarned') ?? 0;
        const levelNow     = this.registry.get('summary_level') ?? 1;
        const xpNow        = this.registry.get('summary_xpNow') ?? 0;
        const xpNeeded     = this.registry.get('summary_xpNeeded') ?? 200;
        const leveledUp    = !!this.registry.get('summary_leveledUp');

        // Section header
        this.add.bitmapText(640, 550, 'pixelFont', 'REWARDS & PROGRESS', 32).setOrigin(0.5);

        // Cash / XP line
        this.add.bitmapText(640, 590, 'pixelFont',
        `+ $${cashEarned}     + ${xpEarned} XP`, 26
        ).setOrigin(0.5);

        // Level & progress bar
        this.add.bitmapText(420, 630, 'pixelFont', `Level ${levelNow}`, 24).setOrigin(0, 0.5);

        // Bar background
        const barX = 620, barY = 670, barW = 360, barH = 16;
        const barBG = this.add.rectangle(barX, barY, barW, barH, 0x333333).setOrigin(0.5);

        // Fill width
        const pct = Phaser.Math.Clamp(xpNow / xpNeeded, 0, 1);
        const barFill = this.add.rectangle(
        barX - barW/2 + (barW * pct)/2, barY, barW * pct, barH, 0x4caf50
        ).setOrigin(0.5);

        // “XP till next” text
        this.add.bitmapText(800, 630, 'pixelFont',
        `${xpNow}/${xpNeeded} XP`, 20
        ).setOrigin(0.5);

        if (leveledUp) {
        this.add.bitmapText(640, 710, 'pixelFont', 'LEVEL UP!', 28)
            .setOrigin(0.5)
            .setTint(0xffd54f);
        }


        //add restart button with white rectangle background
        //add restart container for text and rectangle
        const restartContainer = this.add.container(340, 720).setSize(300, 60).setInteractive();

        //add white rectangle
        const rect = this.add.rectangle(0, 0, 250, 60, 0xFFFFFF);
        restartContainer.add(rect);

        //add restart text
        const restartText = this.add.bitmapText(0, 0, 'pixelFont', 'RESTART', 25).setOrigin(0.5).setTint(0x000000);
        restartContainer.add(restartText);

        //hover effects
        restartContainer.on('pointerover', () => {
            rect.setFillStyle(0xAAAAAA);
        });
        
        restartContainer.on('pointerout', () => {
            rect.setFillStyle(0xFFFFFF);
        });

        restartContainer.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            // stop any lingering bg music defensively
            raceScene?.bgMusic?.stop?.();
            raceScene?.bgMusic?.destroy?.();
            if (isTutorial) {
            // clear tutorial freeze just in case
            raceScene?.setTutorialFrozen?.(false);
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                raceScene.resetRace();
                this.scene.start('RaceScene');
                this.scene.stop();
            });
        });

        //main menu button

        //add menu container for text and rectangle
        const MenuContainer = this.add.container(940, 720).setSize(300, 60).setInteractive();

        //add white rectangle
        const rect1 = this.add.rectangle(0, 0, 250, 60, 0xFFFFFF);
        MenuContainer.add(rect1);

        //add restart text
        const menuText = this.add.bitmapText(0, 0, 'pixelFont', 'MAIN MENU', 25).setOrigin(0.5).setTint(0x000000);
        MenuContainer.add(menuText);

        //hover effects
        MenuContainer.on('pointerover', () => {
            rect1.setFillStyle(0xAAAAAA);
        });
        
        MenuContainer.on('pointerout', () => {
            rect1.setFillStyle(0xFFFFFF);
        });

        MenuContainer.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            raceScene?.bgMusic?.stop?.();
            raceScene?.bgMusic?.destroy?.();
            if (isTutorial) {
            raceScene?.setTutorialFrozen?.(false);
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.launch('MenuScene');
                this.scene.stop();
            });
        });

        if (isTutorial) {
            restartContainer.setVisible(false).disableInteractive();
            MenuContainer.x = 640; // optional
        }

        // === Nudge the whole end-screen UI upward ===
        const SHIFT_UP = 60; // pixels
        this.children.each(child => { child.y -= SHIFT_UP; });
    }  
}