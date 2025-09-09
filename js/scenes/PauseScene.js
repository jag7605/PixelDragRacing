export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    preload() {
        this.load.image('yellowSquare', 'assets/ui/yellowSquare.png');
        this.load.image('play', 'assets/ui/buttonImages/play2.png');
        this.load.image('menu', 'assets/ui/buttonImages/settings2.png');
        this.load.image('replay', 'assets/ui/buttonImages/replay2.png');
        this.load.image('music', 'assets/ui/buttonImages/music.png');
        this.load.image('sound', 'assets/ui/buttonImages/sound.png');
        this.load.image('shop', 'assets/ui/buttonImages/shop.png');
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('resume', 'assets/ui/resume.png');
        this.load.bitmapFont(
            'pixelFont',
            'assets/ui/font/font.png',
            'assets/ui/font/font.xml'  
        );
        this.load.audio('buttonSound', 'assets/sound/button_click.mp3');
    }
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(0.7);

        // paused text
        this.add.bitmapText(645, 155, 'pixelFont', 'PAUSED', 40).setOrigin(0.5);

        const raceScene = this.scene.get('RaceScene');

        if (this.registry.get('sfxMuted') === undefined) {
            this.registry.set('sfxMuted', false);
        }

        if (this.registry.get('musicMuted') === undefined) {
            this.registry.set('musicMuted', false);
        }

        //large resume button
        const resumeButton = this.add.image(640, 440, 'resume')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.6);

        // Hover effects
        resumeButton.on('pointerover', () => {
            resumeButton.setTint(0x888888); // darker tint
        });

        resumeButton.on('pointerout', () => {
            resumeButton.clearTint(); // reset
        });

        resumeButton.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            
            //if the game has started, update totalPausedTime
            if (raceScene.raceStarted) {
                const pauseDuration = this.time.now - this.scene.get('RaceScene').pauseStartTime; // calculate pause duration
                this.scene.get('RaceScene').totalPausedTime += pauseDuration;
            }

            this.scene.stop();            // Stop PauseScene
            this.scene.resume('RaceScene'); // Resume game scene
        });

        //resume text
        this.add.bitmapText(640, 440, 'pixelFont', 'RESUME', 32).setOrigin(0.5);

        // garage button
        const garageButton = this.add.image(450, 300, 'shop')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.5);

        // Hover effects
        garageButton.on('pointerover', () => {
            garageButton.setTint(0x888888); // darker tint
        });

        garageButton.on('pointerout', () => {
            garageButton.clearTint(); // reset
        });

        // Main Menu button

        const menuButton = this.add.image(640, 300, 'menu')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.5);

        // Hover effects
        menuButton.on('pointerover', () => {
            menuButton.setTint(0x888888); // darker tint
        });

        menuButton.on('pointerout', () => {
            menuButton.clearTint(); // reset
        });

        menuButton.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            //stop music
            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
            }
            this.scene.stop();            // Stop PauseScene
            this.scene.launch('MenuScene'); // Go to main menu scene
            this.scene.stop('RaceScene'); // Stop game scene
        });


        // Restart button

        const restartButton  = this.add.image(830, 300, 'replay')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.5);

        // Hover effects
        restartButton.on('pointerover', () => {
            restartButton.setTint(0x888888); // darker tint
        });

        restartButton.on('pointerout', () => {
            restartButton.clearTint(); // reset
        });

        restartButton.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            //stop music
            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
            }
            this.scene.stop();            // Stop PauseScene
            this.scene.launch('RaceScene'); // Restart game scene
        });

        // Music toggle button
        const musicButton = this.add.image(545, 560, 'music')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.3);

        //create crossed line for music off state
        const line = this.add.graphics();
        line.lineStyle(5, 0xff0000, 1);
        line.moveTo(-25, -25);
        line.lineTo(25, 25);
        line.strokePath();
        line.setPosition(musicButton.x, musicButton.y);
       //set to true is music is paused
        let musicMuted = this.registry.get('musicMuted');
        line.setVisible(musicMuted);

        // Hover effects
        musicButton.on('pointerover', () => {
            musicButton.setTint(0x888888); // darker tint
        });

        musicButton.on('pointerout', () => {
            musicButton.clearTint(); // reset
        });

        //for when we add music
        musicButton.on('pointerdown', () => {
            // play sound effect only if not muted
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            musicMuted = !musicMuted;
            this.registry.set('musicMuted', musicMuted);

            if (raceScene.bgMusic) {
                if (musicMuted) {
                    raceScene.bgMusic.pause();
                    line.setVisible(true);  // show cross line
                    musicButton.setTint(0xff0000);
                } else {
                    raceScene.bgMusic.resume();
                    line.setVisible(false); 
                    musicButton.clearTint();
                }
            }
        });

        //sound button

        const soundButton = this.add.image(735, 560, 'sound')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.35);
        
        //create crossed line for sound off state
        const soundLine = this.add.graphics();
        soundLine.lineStyle(5, 0xff0000, 1);
        soundLine.moveTo(-25, -25);
        soundLine.lineTo(25, 25);
        soundLine.strokePath();
        soundLine.setPosition(soundButton.x, soundButton.y);
        const sfxMuted = this.registry.get('sfxMuted');
        soundLine.setVisible(sfxMuted);


        // Hover effects
        soundButton.on('pointerover', () => {
            soundButton.setTint(0x888888); // darker tint
        });

        soundButton.on('pointerout', () => {
            soundButton.clearTint(); // reset
        });

        soundButton.on('pointerdown', () => {
            // play sound effect only if not muted
            const muted = !this.registry.get('sfxMuted');
            this.registry.set('sfxMuted', muted);

            // Toggle line and tint
            if (muted) {
                soundLine.setVisible(true);
                soundButton.setTint(0xff0000);
            } else {
                soundLine.setVisible(false);
                soundButton.clearTint();
            }
        });

        

    }
}