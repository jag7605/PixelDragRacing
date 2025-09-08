import Car from '../gameplay/Car.js';

export default class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    startCountdown() {
        let count = 3;
        let countdownText = this.add.text(400, 300, count, {
            fontSize: "80px",
            color: "#fff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000, // every second
            repeat: 3,   // 3..2..1..GO
            callback: () => {
                if (count > 1) {
                    count--;
                    countdownText.setText(count);
                } else if (count === 1) {
                    count = 0;
                    countdownText.setText("GO!");
                } else {
                    countdownText.destroy();
                    this.raceStarted = true; // 🚦 start race now
                }
            }
        });
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

        this.load.image('pauseButton', 'assets/ui/buttonImages/pause2.png');// load pause button
        this.load.audio('buttonSound', 'assets/ui/button_click.mp3');

        // load Finish_Line to the game
        this.load.image('finishLine', 'assets/backgrounds/Finish_Line.png');
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

        this.raceStarted = false;
        this.startCountdown();

        //pause button in top right corner
        this.pauseButton = this.add.image(1230, 50, 'pauseButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.4);

        // Hover effect: darken
        this.pauseButton.on('pointerover', () => {
            this.pauseButton.setTint(0x888888); // dark tint
        });

        this.pauseButton.on('pointerout', () => {
            this.pauseButton.clearTint(); // remove tint
        });

        this.pauseButton.on('pointerdown', () => {
            this.sound.play('buttonSound'); // play button sound
            this.pauseStartTime = this.time.now; // record when pause started
            this.scene.launch('PauseScene');
            this.scene.bringToTop('PauseScene');
            this.scene.pause();
        });

        // ---draw a trapizium--- 
        let graphics = this.add.graphics();
        graphics.fillStyle(0x1f1f1f, 1);
        graphics.beginPath();
        graphics.moveTo(610, 530); // top-left
        graphics.lineTo(670, 530); // top-right
        graphics.lineTo(800, 720); // bottom-right
        graphics.lineTo(480, 720); // bottom-left
        graphics.closePath();
        graphics.fillPath();

        // ---draw trapizium after the background--- 
        graphics = this.add.graphics();
        graphics.fillStyle(0x333333, 1);
        graphics.beginPath();
        graphics.moveTo(370, 670); // top-left
        graphics.lineTo(500, 670); // top-right
        graphics.lineTo(500, 720); // bottom-right
        graphics.lineTo(400, 720); // bottom-left
        graphics.closePath();
        graphics.fillPath();

        // add the word "GEAR" above the gear indicator
        this.GEAR = this.add.text(405, 670, 'GEAR', {
            fontFamily: 'Digital7',
            fontSize: '15px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // gear indicator with fonts family Digital 7 with slightly glowing effect
        this.getcurrentGear = this.add.text(420, 700, '1', {
            fontFamily: 'Digital7',
            fontSize: '30px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // ---draw a HUD behind gauge---
        this.Gaugebackground = this.add.circle(530, 620, 110, 0x1f1f1f);
        this.Gaugebackground = this.add.circle(750, 620, 110, 0x1f1f1f);

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

            this.add.text(x, y, value.toString(), { fontSize: "10px", color: "#fff" }).setOrigin(0.5).setDepth(5);

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
            tick.strokePath()
            tick.setDepth(5);
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
        redline.strokePath()
        redline.setDepth(5);

        // ---place down RPM numbers in a circular pattern---
        for (let i = 0; i <= RPMsteps; i++) {
            let value = i;
            let angleDeg = Phaser.Math.Linear(RPMstartAngle, RPMendAngle, i / RPMsteps);
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let x = RPMcenterX + RPMradius * Math.cos(angleRad);
            let y = RPMcenterY + RPMradius * Math.sin(angleRad);

            let color = (i >= RPMsteps - 1) ? "#ff0000" : "#ffffff";

            this.add.text(x, y, value.toString(), { fontSize: "15px", color: color }).setOrigin(0.5).setDepth(5);

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
            tick.strokePath()
            tick.setDepth(5);
        }


        //---drawing needles for MPH dial---
        this.mphNeedle = this.add.graphics();
        this.mphNeedle.lineStyle(3, 0xff0000, 1); // red needle
        this.mphNeedle.beginPath();
        this.mphNeedle.moveTo(0, 0);   // needle base (center of dial)
        this.mphNeedle.lineTo(60, 0); // needle length (points upward)
        this.mphNeedle.strokePath();
        this.mphCircle = this.add.circle(750, 620, 10, 0x333333);

        // Position needle at center of MPH dial
        this.mphNeedle.x = MPHcenterX;
        this.mphNeedle.y = MPHcenterY;

        // Rotate to starting angle (0 MPH = far left)
        this.mphNeedle.setRotation(Phaser.Math.DegToRad(MPHstartAngle));


        // ---drawing needles for RPM dial---
        this.rpmNeedle = this.add.graphics();
        this.rpmNeedle.lineStyle(3, 0xff0000, 1); // red needle
        this.rpmNeedle.beginPath();
        this.rpmNeedle.moveTo(0, 0);    // base (center of dial)
        this.rpmNeedle.lineTo(60, 0);   // needle length (points right initially)
        this.rpmNeedle.strokePath();
        this.rpmCircle = this.add.circle(530, 620, 10, 0x333333);

        // Position at dial center
        this.rpmNeedle.x = RPMcenterX;
        this.rpmNeedle.y = RPMcenterY;

        // Set initial rotation (0 RPM = far left)
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction);
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));

        // ---Create shift light (initially grey/off)---
        this.shiftLight = this.add.circle(640, 570, 15, 0x333333);

        if (this.playerCar.rpm >= 8500) {
            this.shiftLight.fillColor = 0xff0000; // bright red when time to shift
        } else {
            this.shiftLight.fillColor = 0x333333; // dim grey when off
        }

        if (this.playerCar.rpm >= 8500) {
            this.shiftLight.visible = Math.floor(time / 200) % 2 === 0; // flashes every 200ms
        } else {
            this.shiftLight.visible = true;
            this.shiftLight.fillColor = 0x333333;
        }

        // represent the speed with fonts digital 7
        this.speedText = this.add.text(620, 690, '0', {
            fontFamily: 'Digital7',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Place finish line off-screen to the right
        this.finishDistance = 400; // meters until finish line
        this.finishLine = this.add.image(1280, 300, 'finishLine').setOrigin(0, 0);
        this.finishLine.visible = false; // hidden until we reach it

        // Depth layers
        this.sky.setDepth(-1);
        this.road.setDepth(0);
        this.finishLine.setDepth(1);
        this.playerCar.sprite.setDepth(2);  // <-- IMPORTANT
        this.rpmDial.setDepth(3);
        this.mphDial.setDepth(3);
        this.speedText.setDepth(3);
        this.rpmNeedle.setDepth(4);
        this.mphNeedle.setDepth(4);
        this.shiftLight.setDepth(4);
        this.getcurrentGear.setDepth(4);
        this.Gaugebackground.setDepth(3);
        graphics.setDepth(2);
        this.pauseButton.setDepth(4);
        this.hudText.setDepth(4);
        this.GEAR.setDepth(4);
        this.rpmCircle.setDepth(4);
        this.mphCircle.setDepth(4);
    }

    update(time, delta) { // update method called every frame
        if (!this.raceStarted) return;

        this.road.tilePositionX += this.playerCar.speed * 0.15; // scroll the road background based on car speed
        this.sky.tilePositionX += this.playerCar.speed * 0.02; // scroll the sky background based on car speed

        this.playerCar.update(delta, this.cursors, this.shiftUpKey, this.shiftDownKey, this.nitrousKey, (time - this.startTime) / 1000);

        this.hudText.setText(
            `Gear: ${this.playerCar.gearSystem.currentGear}\n` + // display current gear
            `Speed: ${this.playerCar.speed.toFixed(1)} km/h\n` + // display current speed
            `RPM: ${this.playerCar.rpm.toFixed(0)}\n` + // display current RPM
            `Accelerating: ${this.playerCar.isAccelerating ? 'YES' : 'NO'}\n` + // display if accelerating
            `Nitrous: ${this.playerCar.nitrousActive ? 'Active' : this.playerCar.nitrousCooldown > 0 ? 'Cooldown' : 'Ready'}\n` + // display nitrous status
            `Time: ${((time - this.startTime - this.totalPausedTime) / 1000).toFixed(1)}s\n` + // display elapsed time excluding pauses
            `Distance: ${this.playerCar.distance.toFixed(0)} m\n` + // display distance traveled
            `Top Speed: ${this.playerCar.topSpeed.toFixed(1)} km/h\n` + // display top speed
            `0-100 Time: ${this.playerCar.zeroToHundredTime ? this.playerCar.zeroToHundredTime.toFixed(2) + 's' : 'N/A'}` // display 0-100 time
        );
        // Update MPH needle rotation based on speed (0 to 280 km/h mapped to -225 to 45 degrees)
        let speedAngle = Phaser.Math.Linear(-225, 45, Phaser.Math.Clamp(this.playerCar.speed / 280, 0, 1));
        this.mphNeedle.setRotation(Phaser.Math.DegToRad(speedAngle));

        // Update RPM needle rotation based on RPM (0 to 10000 RPM mapped to -225 to 45 degrees)
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction);
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));

        // Update shift light based on RPM
        if (this.playerCar.rpm >= 8500) {
            this.shiftLight.fillColor = 0xff0000; // bright red when time to shift
        } else {
            this.shiftLight.fillColor = 0x333333; // dim grey when off
        }

        // update gear indicator
        this.getcurrentGear.setText(this.playerCar.getcurrentGear());

        // Update speed text
        this.speedText.setText(this.playerCar.speed.toFixed(0));

        // Show finish line when player has driven close enough
        if (this.playerCar.distance >= this.finishDistance - 200) {
            this.finishLine.visible = true;
        }

        // Move finish line relative to road scroll
        if (this.finishLine.visible) {
            this.finishLine.x -= this.playerCar.speed * 0.15 * (delta / 16.67);
        }

        // Check if car "crossed" the finish line
        if (this.finishLine.visible && this.finishLine.x <= this.playerCar.x + 100) {
            console.log("Race Finished!");
            this.raceOver();
        }

        // check if the scrolling finish line has moved past the player car go to end scene
        if (this.finishLine.x + this.finishLine.width < 0) {
            this.scene.start('EndScene');
        }
    }
}