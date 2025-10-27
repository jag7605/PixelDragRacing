import Car from '../gameplay/Car.js';
import Bot from '../gameplay/Bot.js';
import PerfectStart from '../gameplay/PerfectStart.js';
import { savePlayerDataFromScene } from '../utils/playerData.js';
import { resizeCar } from '../utils/resize.js';

export default class RaceScene extends Phaser.Scene {
    constructor(key = 'RaceScene') {
        super({key});
    }

    startCountdown() {
        this.perfectStart.startCountdown();
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
                    this.perfectStart.setGoTime(this.time.now); // Notify PerfectStart system that "GO!" has occurred
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

    create() {

        const carData = this.registry.get('selectedCarData') || { body: 'gt40', wheels: 'wheels', wheelScale: 1 };
        const upgrades = this.registry.get('upgrades');
        const upgradeStage = upgrades[carData.type];
        console.log(this.textures.list);

        const carDataArray = this.registry.get('cars');
        const wheelsArray = this.registry.get('wheels');

        //select random bot car body
        const botCarData = carDataArray[Phaser.Math.Between(0, carDataArray.length - 1)];

        const randomBody = Phaser.Utils.Array.GetRandom(botCarData.bodies);

        //select random wheels for bot
        const botWheels = wheelsArray[Phaser.Math.Between(0, wheelsArray.length - 1)];
    

        const groundY = 490; // Y coordinate of the road/ground
        const desiredHeight = 120; // all cars will be this tall

        this.playerCar = new Car(this, 150, 410, upgradeStage);
        this.playerCar.create();
        // bot skill selection
        const botSkill = this.registry.get('botSkill') || 0.7; // fallback to Normal if not set
        this.botCar = new Bot(this, 150, 310, botSkill);
        this.botCar.create();

        // === Cars ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shiftUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.shiftDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.nitrousKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.n2Playing = false;  // nitrous sfx state
        this.sfxNitrous = null;  // holder

        // Perfect Start system
        this.perfectStart = new PerfectStart(this, this.playerCar, this.cursors);

        // Helper: ensure an animation exists for a given spritesheet key
        const makeDriveAnim = (key, fps = 24) => {
            const animKey = `drive_${key}`;
            if (!this.anims.exists(animKey)) {
                const texture = this.textures.get(key);
                const frameCount = texture ? texture.frameTotal : 1;
                let frames = this.anims.generateFrameNumbers(key, { start: 0, end: frameCount - 1 });
                frames = frames.reverse();
                this.anims.create({
                    key: animKey,
                    frames: frames,
                    frameRate: fps,
                    repeat: -1
                });
            }
            return animKey;
        };
        // Build animations we need

        const bodyAnimKey = makeDriveAnim(carData.body);
        if (bodyAnimKey) this.playerCar.bodySprite.play(bodyAnimKey);

        const wheelAnimKey = makeDriveAnim(carData.wheels);
        if (wheelAnimKey) this.playerCar.wheelSprite.play(wheelAnimKey);

        const botWheelAnimKey = makeDriveAnim(botWheels.key);
        if (botWheelAnimKey) this.botCar.wheelSprite.play(wheelAnimKey);

        const botBodyAnimKey = makeDriveAnim(randomBody.key);
        if (botBodyAnimKey) this.botCar.bodySprite.play(wheelAnimKey);

        // Swap textures on already-created sprites from Car/Bot (no Car.js changes)


        this.playerCar.bodySprite.setTexture(carData.body);
        this.playerCar.bodySprite.play(bodyAnimKey);

        this.playerCar.wheelSprite.setTexture(carData.wheels);
        this.playerCar.wheelSprite.play(wheelAnimKey);

        this.botCar.bodySprite.setTexture(randomBody.key);
        this.botCar.bodySprite.play(botBodyAnimKey);

        this.botCar.wheelSprite.setTexture(botWheels.key);
        this.botCar.wheelSprite.play(botWheelAnimKey);

        resizeCar(this.playerCar.bodySprite, desiredHeight, groundY, 0, false);
        resizeCar(this.playerCar.wheelSprite, desiredHeight, groundY, this.registry.get('wheelScale'), false);
        resizeCar(this.botCar.wheelSprite, desiredHeight, groundY - 100, botCarData.wheelScale - 0.2, false);
        resizeCar(this.botCar.bodySprite, desiredHeight, groundY - 100, 0, false);

        //set bot registry 
        this.registry.set('botCarData', {
            body: randomBody.key,
            wheels: botWheels.key
        });

        //if its a troll car, make wheels invisible
        if (carData.body === 'trollcar_white') {
            this.playerCar.wheelSprite.setVisible(false);
            resizeCar(this.playerCar.bodySprite, desiredHeight, groundY, 0, true); // make bigger
        }

        //troll car for bot
        if (randomBody.key === 'trollcar_white') {
            this.botCar.wheelSprite.setVisible(false);
            resizeCar(this.botCar.bodySprite, desiredHeight, groundY - 100, 0, true); // make bigger
        }

        this.resetRace();   // safe now, because cars exist

        // === Track length (in px) ===
        this.trackLength = this.registry.get('trackLength') || 3000;
        console.log("Track Length Loaded:", this.trackLength);

        // === Backgrounds ===
        const mode = this.registry.get('raceMode') || 'day'; // fallback if not set
        const skyTexture = (mode === 'night') ? 'sky_night' : 'sky_day';
        this.sky = this.add.tileSprite(0, 0, 7000, 720, skyTexture)
            .setOrigin(0, 0)
            .setPosition(0, 0)
            .setScale(0.5);
        this.road = this.add.tileSprite(0, 280, this.trackLength, 280, 'road').setOrigin(0, 0);

        this.finishLineX = this.trackLength - 200;
        this.finishLine = this.add.image(this.finishLineX, 325, 'finishLine')
            .setScale(0.9)
            .setOrigin(0, 0)
            .setVisible(false);

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

        //engine sfx
        this.engineIdle  = this.sound.add('sfx_idle',       { loop: true, volume: 0.0 });
        this.engineAccel = this.sound.add('sfx_accelerate', { loop: true, volume: 0.0 });

        // base gains (tweak these)
        this.engineGain = {
        idle: 0.9,   // was 0.4 — make idle louder
        accel: 0.55  // was 0.6 — slightly lower so idle stands out more when not accelerating
        };


        //start the loops if not muted
        if (!this.registry.get('sfxMuted')) {
        this.engineIdle.play();
        this.engineAccel.play();
        }

        //keep audio sane across scene lifecycle
        this.events.on('pause',  () => { this.engineIdle?.pause();  this.engineAccel?.pause();  });
        this.events.on('resume', () => {
        if (this.registry.get('sfxMuted')) return;
        this.engineIdle?.resume(); this.engineAccel?.resume();
        });
        this.events.on('shutdown', () => {
        this.engineIdle?.stop(); this.engineAccel?.stop();
        this.engineIdle?.destroy(); this.engineAccel?.destroy();
        });

        // nitrous cleanup
        this.sfxNitrous?.stop();
        this.sfxNitrous?.destroy();
        this.sfxNitrous = null;
        this.n2Playing = false;
        this.sound.stopByKey('sfx_nitrous');   

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
        this.cameras.main.startFollow(this.playerCar.bodySprite, true, 0.08, 0.08);
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
        graphics.setDepth(3.5);

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
        this.botCar.bodySprite.setDepth(2);
        this.botCar.wheelSprite.setDepth(2);
        this.playerCar.bodySprite.setDepth(2);
        this.playerCar.wheelSprite.setDepth(2);
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

        //ENGINE MIXER: runs always, but accel only when raceStarted is true
        if (this.engineIdle && this.engineAccel) {
            const muted = !!this.registry.get('sfxMuted');
            const accelerating = this.raceStarted && this.playerCar.isAccelerating && this.playerCar.gearSystem.currentGear > 0;

            this.engineIdle.setVolume(muted ? 0 : (accelerating ? 0.0 : this.engineGain.idle));
            this.engineAccel.setVolume(muted ? 0 : (accelerating ? this.engineGain.accel : 0.0));
        }

        if (!this.raceStarted) return;

        if (this.isPaused) return; // skip update if paused

        this.perfectStart.update(); // update Perfect Start system

        // === Update car positions based on distance ===
        this.playerCar.bodySprite.x = 150 + this.playerCar.distance;
        this.playerCar.wheelSprite.x = 150 + this.playerCar.distance;
        this.botCar.bodySprite.x = 150 + this.botCar.distance;
        this.botCar.wheelSprite.x = 150 + this.botCar.distance;

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

        // Nitrous SFX: start when active, stop when not
        if (this.playerCar.nitrousActive && !this.n2Playing && !this.registry.get('sfxMuted')) {
        this.sfxNitrous = this.sound.add('sfx_nitrous', { loop: true, volume: 0.7 });
        this.sfxNitrous.play();
        this.n2Playing = true;
        } 
        
        else if (!this.playerCar.nitrousActive && this.n2Playing) {
        this.sfxNitrous?.stop();
        this.sfxNitrous?.destroy();
        this.sfxNitrous = null;
        this.n2Playing = false;
        }


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
        const playerRightEdge =
            this.playerCar.bodySprite.x + (this.playerCar.bodySprite.displayWidth * (1 - this.playerCar.bodySprite.originX));

        const botRightEdge =
            this.botCar.bodySprite.x + (this.botCar.bodySprite.displayWidth * (1 - this.botCar.bodySprite.originX));

        // Player crosses finish
        if (!this.playerCar.finishTime && playerRightEdge >= this.finishLine.x) {
            this.playerCar.finishTime = (time - this.startTime - this.totalPausedTime) / 1000;
            if (!this.botCar.finishTime) {
                this.dnfCountdown();
                this.dnfTimer = this.time.delayedCall(7000, () => {
                    this.botCar.finishTime = 'DNF';
                });
            }
        }

        // Bot crosses finish
        if (!this.botCar.finishTime && botRightEdge >= this.finishLine.x) {
            this.botCar.finishTime = (time - this.startTime - this.totalPausedTime) / 1000;
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
        // stop update() from running the audio mixer, car logic, etc.
        this.raceStarted = false;   

        // --- stop nitrous sfx if still playing ---
        this.sfxNitrous?.stop();
        this.sfxNitrous?.destroy();
        this.sfxNitrous = null;
        this.n2Playing = false;
        this.sound.stopByKey('sfx_nitrous'); 


        let playerData = this.registry.get("playerData");

        //check who won and calculate stats/money
        let currencyEarned = 0;
        if (this.botCar.finishTime !== 'DNF' && this.playerCar.finishTime !== 'DNF') {
            if (this.playerCar.finishTime < this.botCar.finishTime) {
                this.registry.set('youWin', true);
                currencyEarned = 100;
                playerData.stats.wins += 1;

            } else {
                this.registry.set('youWin', false);
                currencyEarned = 20;
                playerData.stats.losses += 1;
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

        //update player data in registry

        //perfect shift bonus
        if (this.playerCar.getPerfectShiftPercentage() === 100 && this.playerCar.getShiftCount() > 0) {
            currencyEarned += 50; // bonus for perfect shifts
        }

        playerData.currency += currencyEarned;
        playerData.totalCurrencyEarned += currencyEarned;

        //check for fastest time
        if (this.playerCar.finishTime && (!playerData.fastestTime || this.playerCar.finishTime < playerData.fastestTime)) {
            playerData.fastestTime = this.playerCar.finishTime;
        }

        // Save updated player back to registry
        this.registry.set("playerData", playerData);

        //save to localStorage
        savePlayerDataFromScene(this);

        this.time.delayedCall(500, () => {
            this.sound.stopByKey('sfx_nitrous'); 
            this.bgMusic?.stop();
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
        this.playerCar.bodySprite.x = 150;
        this.playerCar.wheelSprite.x = 150;
        this.botCar.bodySprite.x = 150;
        this.botCar.wheelSprite.x = 150;

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

        this.perfectStart.reset();
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