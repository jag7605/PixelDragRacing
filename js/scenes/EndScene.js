export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {
        const raceScene = this.scene.get('RaceScene');

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
        this.add.bitmapText(640, 100, 'pixelFont', 'GAME OVER', 60).setOrigin(0.5);

        //you win or you lose text
        this.add.bitmapText(640, 200, 'pixelFont', result, 50).setOrigin(0.5);

        //display final time
        this.add.bitmapText(640, 300, 'pixelFont', `Your Time: ${displayFinalTime}`, 30).setOrigin(0.5);

        //bot time
        this.add.bitmapText(640, 360, 'pixelFont', `Opponent Time: ${displayBotTime}`, 30).setOrigin(0.5);

        //0-100 time
        //if zeroToHundredTime is null display N/A
        if (zeroToHundredTime === null) {
            this.add.bitmapText(640, 420, 'pixelFont', `0-100 Time: N/A`, 30).setOrigin(0.5);
        } else {
            this.add.bitmapText(640, 420, 'pixelFont', `0-100 Time: ${zeroToHundredTime.toFixed(2)}s`, 30).setOrigin(0.5);
        }

        //top speed
        this.add.bitmapText(640, 480, 'pixelFont', `Top Speed: ${topSpeed.toFixed(1)} km/h`, 30).setOrigin(0.5);

        //perfect shifts
        this.add.bitmapText(640, 540, 'pixelFont', 
            `Perfect Shifts: ${perfectShifts} / ${shiftCount} (${perfectShiftPercent}%)`, 
            30
        ).setOrigin(0.5);


        //add restart button with white rectangle background
        //add restart container for text and rectangle
        const restartContainer = this.add.container(340, 660).setSize(300, 60).setInteractive();

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

            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
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
        const MenuContainer = this.add.container(940, 660).setSize(300, 60).setInteractive();

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

            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.launch('MenuScene');
                this.scene.stop();
            });
        });
    }  
}