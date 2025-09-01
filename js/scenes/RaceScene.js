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

        // load RPM dial and MPH dial to the game
        this.load.image('rpmDial', 'assets/Speedometer/RPM.png');
        this.load.image('mphDial', 'assets/Speedometer/MPH.png');
    }

    create() {
        this.sky = this.add.tileSprite(0, 0, 1280, 720, 'sky').setOrigin(0, 0); // create sky background
        this.road = this.add.tileSprite(0, 300, 1280, 256, 'road').setOrigin(0, 0); // create road background

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


        //radius for MPH number circular placement
        let MPHcenterX = 750;
        let MPHcenterY = 617;
        let MPHradius = 70;
        let MPHstartAngle = -225; // start angle (degrees)
        let MPHendAngle = 45;  // end angle (degrees)
        let MPHsteps = 14;  // spacing between numbers

        // radius for RPM number circular placement
        let RPMcenterX = 530;
        let RPMcenterY = 620;
        let RPMradius = 70;
        let RPMstartAngle = -225; // start angle (degrees)
        let RPMendAngle = 45;  // end angle (degrees)
        let RPMsteps = 10;  // spacing between numbers

        //place down RPM and MPH dials
        this.rpmDial = this.add.image(530, 620, 'rpmDial').setScale(0.5);
        this.mphDial = this.add.image(750, 620, 'mphDial').setScale(0.5);

        //place down MPH numbers in a circular pattern
        for (let i = 0; i <= MPHsteps; i++) {
            let value = i * 20;
            let angleDeg = Phaser.Math.Linear(MPHstartAngle, MPHendAngle, i / MPHsteps);
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let x = MPHcenterX + MPHradius * Math.cos(angleRad);
            let y = MPHcenterY + MPHradius * Math.sin(angleRad);

            this.add.text(x, y, value.toString(), { fontSize: "10px", color: "#fff" }).setOrigin(0.5);

            // Draw tick line
            let innerRadius = MPHradius + 15; // start of line (closer to center)
            let outerRadius = MPHradius + 10;  // end of line (goes outside the numbers)

            let tick = this.add.graphics();
            tick.lineStyle(2, 0xffffff); // white tick
            tick.beginPath();
            tick.moveTo(MPHcenterX + innerRadius * Math.cos(angleRad),
                MPHcenterY + innerRadius * Math.sin(angleRad));
            tick.lineTo(MPHcenterX + outerRadius * Math.cos(angleRad),
                MPHcenterY + outerRadius * Math.sin(angleRad));
            tick.strokePath();
        }

        // Draw redline arc on RPM dial (8.5k to 10k)
        let redline = this.add.graphics();
        redline.lineStyle(6.5, 0xff0000, 1); // thick red arc

        // Convert RPM values to dial angles
        let startFraction = 8500 / 10000; // 0.85
        let endFraction = 1.0;            // 10k

        let startAngle = Phaser.Math.DegToRad(
            Phaser.Math.Linear(RPMstartAngle, RPMendAngle, startFraction)
        );
        let endAngle = Phaser.Math.DegToRad(
            Phaser.Math.Linear(RPMstartAngle, RPMendAngle, endFraction)
        );

        // Draw the arc
        redline.beginPath();
        let redlineRadius = RPMradius + 12; // push arc further outside the numbers
        redline.arc(RPMcenterX, RPMcenterY, redlineRadius, startAngle, endAngle, false);
        redline.strokePath();

        //place down RPM numbers in a circular pattern
        for (let i = 0; i <= RPMsteps; i++) {
            let value = i;
            let angleDeg = Phaser.Math.Linear(RPMstartAngle, RPMendAngle, i / RPMsteps);
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let x = RPMcenterX + RPMradius * Math.cos(angleRad);
            let y = RPMcenterY + RPMradius * Math.sin(angleRad);

            let color = (i >= RPMsteps - 1) ? "#ff0000" : "#ffffff";

            this.add.text(x, y, value.toString(), { fontSize: "15px", color: color }).setOrigin(0.5);

            // Draw tick line
            let innerRadius = RPMradius + 20;
            let outerRadius = RPMradius + 10;

            let tick = this.add.graphics();
            tick.lineStyle(2, 0xffffff);
            tick.beginPath();
            tick.moveTo(RPMcenterX + innerRadius * Math.cos(angleRad),
                RPMcenterY + innerRadius * Math.sin(angleRad));
            tick.lineTo(RPMcenterX + outerRadius * Math.cos(angleRad),
                RPMcenterY + outerRadius * Math.sin(angleRad));
            tick.strokePath();
        }


        //drawing needles for MPH dial
        this.mphNeedle = this.add.graphics();
        this.mphNeedle.lineStyle(3, 0xff0000, 1); // red needle
        this.mphNeedle.beginPath();
        this.mphNeedle.moveTo(0, 0);   // needle base (center of dial)
        this.mphNeedle.lineTo(60, 0); // needle length (points upward)
        this.mphNeedle.strokePath();

        // Position needle at center of MPH dial
        this.mphNeedle.x = MPHcenterX;
        this.mphNeedle.y = MPHcenterY;

        // Rotate to starting angle (0 MPH = far left)
        this.mphNeedle.setRotation(Phaser.Math.DegToRad(MPHstartAngle));


        // drawing needles for RPM dial
        this.rpmNeedle = this.add.graphics();
        this.rpmNeedle.lineStyle(3, 0xff0000, 1); // red needle
        this.rpmNeedle.beginPath();
        this.rpmNeedle.moveTo(0, 0);    // base (center of dial)
        this.rpmNeedle.lineTo(50, 0);   // needle length (points right initially)
        this.rpmNeedle.strokePath();

        // Position at dial center
        this.rpmNeedle.x = RPMcenterX;
        this.rpmNeedle.y = RPMcenterY;

        // Set initial rotation (0 RPM = far left)
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction);
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));
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
        // Update MPH needle rotation based on speed (0 to 280 km/h mapped to -225 to 45 degrees)
        let speedAngle = Phaser.Math.Linear(-225, 45, Phaser.Math.Clamp(this.playerCar.speed / 280, 0, 1));
        this.mphNeedle.setRotation(Phaser.Math.DegToRad(speedAngle));

        // Update RPM needle rotation based on RPM (0 to 10000 RPM mapped to -225 to 45 degrees)
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction) - 20;
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));
    }
}