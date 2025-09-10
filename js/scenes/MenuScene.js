export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Background
        this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
        this.load.image('road', 'assets/backgrounds/road_tile_256px.png');

        //Buttons
        this.load.image('start_btn', 'assets/ui/buttonImages/start_btn.png'); 
        this.load.image('steeringWheel', 'assets/steering_wheel.png');
        this.load.image('wrench', 'assets/wrench.png');
    }

    create() {
        // Background
        this.add.image(640, 360, 'sky').setDisplaySize(1280, 720);
        this.add.image(640, 550, 'road').setDisplaySize(1280, 256);

        // Title
        this.add.text(640, 150, "Pixel", {
            font: "64px Arial",
            fill: "#000",
            stroke: "#fff",
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 230, "Drag Racing", {
            font: "64px Arial",
            fill: "#000",
            stroke: "#fff",
            strokeThickness: 6
        }).setOrigin(0.5);

        // Buttons (x, y, key, label, action)
        this.createMenuButton(440, 600, 'wrench', 'Settings', () => {
            this.scene.start('SettingsScene');
        });

        this.createMenuButton(640, 600, 'start_btn', '', () => {   // ✅ no need for “Start” text in file name
            this.scene.start('RaceScene');
        });

        this.createMenuButton(840, 600, 'garage_icon', 'Garage', () => {
            this.scene.start('GarageScene');
        });
    }

    createMenuButton(x, y, key, label, callback) {
        const btn = this.add.image(x, y, key).setScale(0.6).setInteractive();

        if (label) {
            this.add.text(x, y + 60, label, {
                font: "24px Arial",
                fill: "#fff",
                stroke: "#000",
                strokeThickness: 3
            }).setOrigin(0.5);
        }

        btn.on('pointerover', () => btn.setScale(0.7));
        btn.on('pointerout', () => btn.setScale(0.6));
        btn.on('pointerdown', callback);
    }
}
