import Car from '../gameplay/Car.js';
import Bot from '../gameplay/Bot.js';

export default class RaceScene extends Phaser.Scene {
    constructor() {
        super('RaceScene');
    }

    startCountdown() {
        let count = 3;
        let countdownText = this.add.text(400, 300, count - 1, {
            fontSize: "80px",
            color: "#fff",
            fontStyle: "bold"
        }).setOrigin(0.5).setScrollFactor(0);

        let countdownBeep = this.sound.add('redBeep', { volume: 0.5 });
        let goBeep = this.sound.add('goBeep', { volume: 0.5 });

        this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
                if (count > 1) {
                    countdownBeep.play();
                    countdownText.setText(count);
                    count--;
                } else if (count === 1) {
                    countdownBeep.play();
                    countdownText.setText(count);
                    count--;
                } else {
                    countdownText.setText("GO!");  // Change text to "GO!"
                    goBeep.play();

                    this.time.delayedCall(500, () => {
                        countdownText.destroy();
                    });

                    this.raceStarted = true;
                    this.startTime = this.time.now;

                    // === Random Background Music ===
                    const tracks = ['bgMusic1', 'bgMusic2', 'bgMusic3'];
                    const randomTrack = Phaser.Utils.Array.GetRandom(tracks);

                    // Stop previous music
                    if (this.bgMusic) {
                        this.bgMusic.stop();
                        this.bgMusic.destroy();
                    }

                    // Add and play new music
                    this.bgMusic = this.sound.add(randomTrack, { volume: 0.5, loop: true });
                    this.bgMusic.play();

                    // Save as last played track
                    this.registry.set('lastBgMusic', randomTrack);

                    // Respect mute
                    if (this.registry.get('musicMuted') && this.bgMusic.isPlaying) {
                        this.bgMusic.pause();
                    }
                }
            }
        });
    }

    preload() {
        this.load.image('sky', 'assets/backgrounds/sky_day_1440x1080.png');
        this.load.image('road', 'assets/backgrounds/road_tile_256px.png');

        // Load both cars for the race scene
        this.load.spritesheet('beater_car', 'assets/cars/beater_car_ride.png', {
            frameWidth: 192,
            frameHeight: 192
        });

        this.load.spritesheet('beater_jeep', 'assets/cars/beater_jeep_ride.png', {
            frameWidth: 256,
            frameHeight: 256
        });

        this.load.image('rpmDial', 'assets/Speedometer/RPM.png');
        this.load.image('mphDial', 'assets/Speedometer/MPH.png');

        this.load.image('pauseButton', 'assets/ui/buttonImages/pause2.png');
        this.load.audio('buttonSound', 'assets/sound/button_click.mp3');
        this.load.audio('bgMusic1', 'assets/sound/bgMusic.mp3');
        this.load.audio('bgMusic2', 'assets/sound/bgMusic2.mp3');
        this.load.audio('bgMusic3', 'assets/sound/bgMusic3.mp3');

        this.load.image('finishLine', 'assets/backgrounds/Finish_Line.png');

        this.load.audio('redBeep', 'assets/sound/RedBeep.mp3');
        this.load.audio('goBeep', 'assets/sound/GoBeep.mp3');
    }

    create() {

        if (!this.registry.get('selectedCar')) {
            this.registry.set('selectedCar', 'beater_jeep');
        }

        const selectedKey = this.registry.get('selectedCar') || 'beater_jeep';
        const upgrades = this.registry.get('upgrades') || {};
        const upgradeStage = upgrades[selectedKey] || 1;

        this.playerCar = new Car(this, 150, 410, upgradeStage);
        this.botCar = new Bot(this, 150, 310, 0.1);

        // Helper: ensure an animation exists for a given spritesheet key
        const makeDriveAnim = (key, fps = 24) => {
            const animKey = `drive_${key}`;
            if (!this.anims.exists(animKey)) {
                // If you’re unsure of exact frame count, 0..7 works for your current sheets.
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(key, { start: 0, end: 7 }),
                    frameRate: fps,
                    repeat: -1
                });
            }
            return animKey;
        };


        
        // Build animations we need
        const playerAnimKey = makeDriveAnim(selectedKey);
        const botAnimKey = makeDriveAnim('beater_jeep');

        // Swap textures on already-created sprites from Car/Bot (no Car.js changes)
        this.playerCar.sprite.setTexture(selectedKey);
        this.playerCar.sprite.play(playerAnimKey);

        this.botCar.sprite.setTexture('beater_jeep');
        this.botCar.sprite.play(botAnimKey);

        this.resetRace();   // safe now, because cars exist

        // === Track length (in px) ===
        this.trackLength = 3000;

        // === Backgrounds ===
        this.sky = this.add.tileSprite(0, 0, this.trackLength, 720, 'sky').setOrigin(0, 0);
        this.road = this.add.tileSprite(0, 325, this.trackLength, 256, 'road').setOrigin(0, 0);

        this.finishLineX = this.trackLength - 200;
        this.finishLine = this.add.image(this.finishLineX, 325, 'finishLine')
            .setOrigin(0, 0)
            .setVisible(false);




        // === Cars ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shiftUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.shiftDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.nitrousKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // === HUD ===
        this.hudText = this.add.text(20, 20, '', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0, 0).setScrollFactor(0);

        this.raceStarted = false;
        this.startTime = 0;
        this.totalPausedTime = 0;
        this.pauseStartTime = 0;
        this.startCountdown();

        // === Pause button ===
        this.pauseButton = this.add.image(1230, 50, 'pauseButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.4)
            .setScrollFactor(0);

        this.pauseButton.on('pointerover', () => {
            this.pauseButton.setTint(0x888888);
        });
        this.pauseButton.on('pointerout', () => {
            this.pauseButton.clearTint();
        });
        this.pauseButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            if (this.raceStarted) {
                this.pauseStartTime = this.time.now;
            }
            this.scene.launch('PauseScene');
            this.scene.bringToTop('PauseScene');
            this.scene.pause();
        });

        // === Camera follow ===
        this.cameras.main.startFollow(this.playerCar.sprite, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, this.trackLength, 720);

        // === Gauges, needles, HUD graphics ===
        // Example:
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
        graphics.setScrollFactor(0);

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
        graphics.setScrollFactor(0);

        // add the word "GEAR" above the gear indicator
        this.GEAR = this.add.text(405, 670, 'GEAR', {
            fontFamily: 'Digital7',
            fontSize: '15px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        // gear indicator with fonts family Digital 7 with slightly glowing effect
        this.getcurrentGear = this.add.text(420, 700, '1', {
            fontFamily: 'Digital7',
            fontSize: '30px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0);

        this.Gaugebackground = this.add.circle(530, 620, 110, 0x1f1f1f).setScrollFactor(0);
        this.Gaugebackground = this.add.circle(750, 620, 110, 0x1f1f1f).setScrollFactor(0);

        this.rpmDial = this.add.image(530, 620, 'rpmDial').setScale(0.5).setScrollFactor(0);
        this.mphDial = this.add.image(750, 620, 'mphDial').setScale(0.5).setScrollFactor(0);

        let MPHcenterX = 750;
        let MPHcenterY = 617;
        let MPHradius = 70;
        let MPHstartAngle = -225; // start angle (degrees)
        let MPHendAngle = 45;  // end angle (degrees)
        let MPHsteps = 14;  // spacing between numbers

        let RPMcenterX = 530;
        let RPMcenterY = 620;
        let RPMradius = 70;
        let RPMstartAngle = -225; // start angle (degrees)
        let RPMendAngle = 45;  // end angle (degrees)
        let RPMsteps = 10;  // spacing between numbers

        // Draw numbers and tick marks for MPH dial
        for (let i = 0; i <= MPHsteps; i++) {
            let value = i * 20;
            let angleDeg = Phaser.Math.Linear(MPHstartAngle, MPHendAngle, i / MPHsteps);
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let x = MPHcenterX + MPHradius * Math.cos(angleRad);
            let y = MPHcenterY + MPHradius * Math.sin(angleRad);

            this.add.text(x, y, value.toString(), { fontSize: "10px", color: "#fff" }).setOrigin(0.5).setDepth(5).setScrollFactor(0);

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
            tick.setScrollFactor(0)
            tick.setDepth(5);
        }

        // Draw redline arc on RPM dial (8.5k to 10k)
        let redline = this.add.graphics();
        redline.lineStyle(6.5, 0xff0000, 1); // thick red arc

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
        redline.setScrollFactor(0);
        redline.setDepth(5);

        // ---place down RPM numbers in a circular pattern---
        for (let i = 0; i <= RPMsteps; i++) {
            let value = i;
            let angleDeg = Phaser.Math.Linear(RPMstartAngle, RPMendAngle, i / RPMsteps);
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let x = RPMcenterX + RPMradius * Math.cos(angleRad);
            let y = RPMcenterY + RPMradius * Math.sin(angleRad);

            let color = (i >= RPMsteps - 1) ? "#ff0000" : "#ffffff";

            this.add.text(x, y, value.toString(), { fontSize: "15px", color: color }).setOrigin(0.5).setDepth(5).setScrollFactor(0);

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
            tick.setScrollFactor(0)
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
        this.mphNeedle.setScrollFactor(0);
        this.mphCircle.setScrollFactor(0);

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
        this.rpmNeedle.setScrollFactor(0);
        this.rpmCircle.setScrollFactor(0);

        // Position at dial center
        this.rpmNeedle.x = RPMcenterX;
        this.rpmNeedle.y = RPMcenterY;

        // Set initial rotation (0 RPM = far left)
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction);
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));

        // ---Create shift light (initially grey/off)---
        this.shiftLight = this.add.circle(640, 570, 15, 0x333333).setScrollFactor(0);

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
        }).setOrigin(0.5).setScrollFactor(0);

        this.sky.setDepth(-1);
        this.road.setDepth(0);
        this.finishLine.setDepth(1);
        this.botCar.sprite.setDepth(2);
        this.playerCar.sprite.setDepth(2);
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

    update(time, delta) {
        if (!this.raceStarted) return;

        // === Update car positions based on distance ===
        this.playerCar.sprite.x = 150 + this.playerCar.distance;
        this.botCar.sprite.x = 150 + this.botCar.distance;

        // Show and scroll finish line when player is near
        const distanceToFinish = this.finishLineX - (150 + this.playerCar.distance);

        if (distanceToFinish <= 800) { // show it when near
            this.finishLine.setVisible(true);

            // Scroll finish line with the road
            this.finishLine.x -= (this.playerCar.speed / 50) * (delta / 16.67) * 3; // same direction as road tile
        }

        // === Update cars ===
        this.playerCar.update(delta, this.cursors, this.shiftUpKey, this.shiftDownKey, this.nitrousKey,
            (time - this.startTime - this.totalPausedTime) / 1000);
        this.botCar.update(delta, time);

        let pxPerFrame = (this.playerCar.speed / 50) * (delta / 16.67); // tweak divisor for intensity
        this.road.tilePositionX += pxPerFrame * 3; // exaggerate by x3
        this.sky.tilePositionX += pxPerFrame * 0.5; // slower for parallax


        // === HUD update ===
        this.hudText.setText(
            `Gear: ${this.playerCar.gearSystem.currentGear}\n` +
            `Speed: ${this.playerCar.speed.toFixed(1)} km/h\n` +
            `RPM: ${this.playerCar.rpm.toFixed(0)}\n` +
            `Accelerating: ${this.playerCar.isAccelerating ? 'YES' : 'NO'}\n` +
            `Nitrous: ${this.playerCar.nitrousActive ? 'Active' : this.playerCar.nitrousCooldown > 0 ? 'Cooldown' : 'Ready'}\n` +
            `Time: ${((time - this.startTime - this.totalPausedTime) / 1000).toFixed(1)}s\n` +
            `Distance: ${this.playerCar.distance.toFixed(0)} m\n` +
            `Top Speed: ${this.playerCar.topSpeed.toFixed(1)} km/h\n` +
            `0-100 Time: ${this.playerCar.zeroToHundredTime ? this.playerCar.zeroToHundredTime.toFixed(2) + 's' : 'N/A'}`
        );

        // Update MPH needle
        let speedAngle = Phaser.Math.Linear(-225, 45, Phaser.Math.Clamp(this.playerCar.speed / 280, 0, 1));
        this.mphNeedle.setRotation(Phaser.Math.DegToRad(speedAngle));

        // Update RPM needle
        let rpmFraction = Phaser.Math.Clamp(this.playerCar.rpm / 10000, 0, 1);
        let rpmAngle = Phaser.Math.Linear(-225, 45, rpmFraction);
        this.rpmNeedle.setRotation(Phaser.Math.DegToRad(rpmAngle));

        // Update shift light
        if (this.playerCar.rpm >= 8500) {
            this.shiftLight.fillColor = 0xff0000;
        } else {
            this.shiftLight.fillColor = 0x333333;
        }

        // Update gear and speed display
        this.getcurrentGear.setText(this.playerCar.getcurrentGear());
        this.speedText.setText(this.playerCar.speed.toFixed(0));

        // === Finish line check ===
        //player crosses finish line
        // Check if player touches finish line
        if (!this.playerCar.finishTime && this.playerCar.sprite.x + this.playerCar.sprite.width >= this.finishLine.x) {
            this.playerCar.finishTime = (time - this.startTime - this.totalPausedTime) / 1000;

            // Start bot DNF timer if bot hasn't finished
            if (!this.botCar.finishTime) {
                this.dnfCountdown();
                this.dnfTimer = this.time.delayedCall(7000, () => {
                    this.botCar.finishTime = 'DNF';
                });
            }
        }

        // Check if bot touches finish line
        if (!this.botCar.finishTime && this.botCar.sprite.x + this.botCar.sprite.width >= this.finishLine.x) {
            this.botCar.finishTime = (time - this.startTime - this.totalPausedTime) / 1000;

            // Start player DNF timer if player hasn't finished
            if (!this.playerCar.finishTime) {
                this.dnfCountdown();
                this.dnfTimer = this.time.delayedCall(7000, () => {
                    this.playerCar.finishTime = 'DNF';
                });
            }
        }

        //end game if both cars have finished
        if (this.playerCar.finishTime && this.botCar.finishTime) {
            this.raceOver();
        }
    }

    raceOver() {
        if (this.raceEnded) return;
        this.raceEnded = true;

        //check who won
        if (this.botCar.finishTime !== 'DNF' && this.playerCar.finishTime !== 'DNF') {
            if (this.playerCar.finishTime < this.botCar.finishTime) {
                this.registry.set('youWin', true);
            } else {
                this.registry.set('youWin', false);
            }
        }
        else if (this.playerCar.finishTime === 'DNF') {
            this.registry.set('youWin', false); // player DNF
            this.playerCar.finishTime = null; // set to null for display purposes
        }
        else {
            this.registry.set('youWin', true);
            this.botCar.finishTime = null; // set to null for display purposes
        }

        this.registry.set('finalTime', this.playerCar.finishTime);
        this.registry.set('topSpeed', this.playerCar?.topSpeed || 0);
        this.registry.set('zeroToHundredTime', this.playerCar?.zeroToHundredTime ?? null);
        this.registry.set('botTime', this.botCar.finishTime);
        this.registry.set('perfectShifts', this.playerCar.getPerfectShifts());
        this.registry.set('shiftCount', this.playerCar.getShiftCount());
        this.registry.set('perfectShiftPercent', this.playerCar.getPerfectShiftPercentage());

        this.time.delayedCall(500, () => {
            this.scene.start("EndScene");
        });
    }

    resetRace() {
        this.raceStarted = false;
        this.raceEnded = false;
        this.startTime = 0;
        this.totalPausedTime = 0;
        this.playerCar.finishTime = null;
        this.botCar.finishTime = null;
        this.dnfTimer = null;

        this.playerCar.distance = 0;
        this.botCar.distance = 0;
        this.playerCar.sprite.x = 150;
        this.botCar.sprite.x = 150;

        this.registry.set('finalTime', 0);
        this.registry.set('topSpeed', 0);
        this.registry.set('zeroToHundredTime', null);
        this.registry.set('youWin', false);
        this.registry.set('botTime', 0);
        this.registry.set('perfectShifts', 0);
        this.registry.set('shiftCount', 0);
        this.registry.set('perfectShiftPercent', 0);

        //reset dnf timer
        if (this.dnfTimer) {
            this.dnfTimer.remove();
            this.dnfTimer = null;
        }
    }

    dnfCountdown() {
        let count = 7;
        let dnfText = this.add.text(640, 300, null, {
            fontSize: "80px",
            color: "#fff",
            fontStyle: "bold"
        }).setOrigin(0.5).setScrollFactor(0);

        this.time.addEvent({
            delay: 1000,
            repeat: 7,
            callback: () => {
                if (count > 0 && count <= 5) {
                    dnfText.setText(count);
                    count--;
                }
                else if (count > 5) {
                    count--;
                }
                else {
                    dnfText.destroy();
                }
            }
        });
    }
}
