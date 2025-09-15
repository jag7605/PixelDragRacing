export default class InfoScene extends Phaser.Scene {
    constructor() {
        super('InfoScene');
    }

    preload() {
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('yellowSquare', 'assets/ui/yellowSquare.png');
        this.load.bitmapFont(
            'pixelFont',
            'assets/ui/font/font.png',
            'assets/ui/font/font.xml'  
        );
        this.load.audio('buttonSound', 'assets/sound/button_click.mp3');
    }
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setInteractive().setDepth(0);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1.2, 0.7);

        // how to play text
        this.add.bitmapText(645, 155, 'pixelFont', 'HOW TO PLAY', 40).setOrigin(0.5);

        // controls list
        const controls = [
            { key: 'UP', action: 'Accelerate' },
            { key: 'DOWN', action: 'Brake' },
            { key: 'E', action: 'Shift Up' },
            { key: 'Q', action: 'Shift Down' },
            { key: 'SPACE', action: 'Use Nitrous' },
        ];

        //display controls
        controls.forEach((control, index) => {
            this.add.bitmapText(500, 280 + index * 50, 'pixelFont', control.action, 30).setOrigin(0.5).setTint(0x852020);
            this.add.bitmapText(850, 280 + index * 50, 'pixelFont', control.key, 30).setOrigin(0.5).setTint(0x852020);
        });

        // x in corner to close
        const closeButton = this.add.text(1050, 100, 'X', { font: '40px Arial', fill: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(2);
            
        closeButton.on('pointerover', () => {
            closeButton.setStyle({ fill: '#ff0000' });
        });
        closeButton.on('pointerout', () => {
            closeButton.setStyle({ fill: '#ffffff' });
        });

        closeButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            if (this.scene.isPaused('MenuScene')) {
                this.scene.resume('MenuScene');
            }

            this.scene.stop();
        });

    }
}