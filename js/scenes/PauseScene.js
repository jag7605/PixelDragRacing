export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    preload() {
        this.load.image('yellowSquare', 'assets/ui/yellowSquare.png');
        this.load.image('play', 'assets/ui/buttonImages/play2.png');
        this.load.image('menu', 'assets/ui/buttonImages/settings2.png');
        this.load.image('replay', 'assets/ui/buttonImages/replay2.png');
        this.load.image('music', 'assets/ui/buttonImages/sound2.png');
        this.load.image('shop', 'assets/ui/buttonImages/shop.png');
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('resume', 'assets/ui/resume.png');
        this.load.bitmapFont(
            'pixelFont',
            'assets/ui/font/font.png',
            'assets/ui/font/font.xml'  
        );
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
        line.setVisible(this.sound.mute); // only show if music is off

        // Hover effects
        musicButton.on('pointerover', () => {
            musicButton.setTint(0x888888); // darker tint
        });

        musicButton.on('pointerout', () => {
            musicButton.clearTint(); // reset
        });

        //for when we add music
        musicButton.on('pointerdown', () => {
            // Toggle music on/off
            if (this.sound.mute) {
                this.sound.mute = false;
                line.setVisible(false); // hide line to indicate music is on
                musicButton.clearTint(); // reset tint to indicate music is on
            } else {
                this.sound.mute = true;
                line.setVisible(true); // show line to indicate music is off
                musicButton.setTint(0xff0000); // red tint to indicate music is off
            }
        });

        //other button
        const otherButton = this.add.image(735, 560, 'music')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(0.3);
    }
}