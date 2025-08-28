import Car from '../gameplay/Car.js';

export default class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene'); 
    }

    preload() {
        this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png'); // load sky background
        this.load.image('road', 'assets/backgrounds/road_tile_256px.png'); // load road background
        this.load.spritesheet('car', 'assets/cars/beater_jeep_ride.png', { // load car sprite sheet
            frameWidth: 256,
            frameHeight: 256
        });

        this.load.image('guage', 'assets/ui/Speedometer1/AUS1.png'); // load speedometer image
    }

    create() {
        this.sky = this.add.tileSprite(0, 0, 1280, 720, 'sky').setOrigin(0, 0); // create sky background
        this.road = this.add.tileSprite(0, 300, 1280, 256, 'road').setOrigin(0, 0); // create road background
        this.guage = this.add.image(640, 650, 'guage').setScale(0.5); // create speedometer image

        this.anims.create({ // create car animation
            key: 'drive',
            frames: this.anims.generateFrameNumbers('car', { start: 0, end: 7 }),
            frameRate: 24,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys(); // create cursor keys for input
        this.shiftUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // key for shifting up
        this.shiftDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // key for shifting down
        this.nitrousKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // key for nitrous boost

        this.playerCar = new Car(this, 150, 410); // create player car instance

        this.hudText = this.add.text(20, 20, '', { // create HUD text
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0, 0);

        this.startTime = this.time.now; 
    }

    update(time, delta) { // update method called every frame
        this.road.tilePositionX += this.playerCar.speed * 0.15; // scroll the road background based on car speed
        this.sky.tilePositionX += this.playerCar.speed * 0.02; // scroll the sky background based on car speed

        this.playerCar.update(delta, this.cursors, this.shiftUpKey, this.shiftDownKey, this.nitrousKey, (time - this.startTime) / 1000);

        this.hudText.setText(
            `Gear: ${this.playerCar.gearSystem.currentGear}\n` + // display current gear
            `Speed: ${this.playerCar.speed.toFixed(1)} km/h\n` + // display current speed
            `RPM: ${this.playerCar.rpm.toFixed(0)}\n` + // display current RPM
            `Accelerating: ${this.playerCar.isAccelerating ? 'YES' : 'NO'}\n` + // display if accelerating
            `Nitrous: ${this.playerCar.nitrousActive ? 'Active' : this.playerCar.nitrousCooldown > 0 ? 'Cooldown' : 'Ready'}\n` + // display nitrous status
            `Time: ${((time - this.startTime) / 1000).toFixed(1)}s\n` + // display elapsed time
            `Distance: ${this.playerCar.distance.toFixed(0)} m\n` + // display distance traveled
            `Top Speed: ${this.playerCar.topSpeed.toFixed(1)} km/h\n` + // display top speed
            `0-100 Time: ${this.playerCar.zeroToHundredTime ? this.playerCar.zeroToHundredTime.toFixed(2) + 's' : 'N/A'}` // display 0-100 time
        );
    }
}