import GearSystem from './GearSystem.js';

export default class Bot {
    constructor(scene, x, y, skill = 0.7) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, 'car').setScale(1);

        this.speed = 0;
        this.rpm = 800;
        this.maxRPM = 9000;
        this.redline = 8500;
        this.acceleration = 0;
        this.distance = 0;
        this.topSpeed = 0;
        this.zeroToHundredTime = null;

        this.gearSystem = new GearSystem();

        // Nitrous system
        this.nitrousActive = false;
        this.nitrousDuration = 3000;
        this.nitrousCooldown = 0;
        this.nitrousBoost = 1.8;

        // Bot logic
        this.skill = skill; // 0–1 (higher = more consistent)
        this.nextShiftRPM = this.getRandomShiftRPM(); // target rpm to shift
        this.nitrousUsed = false; // has bot used nitrous yet
    }

    getRandomShiftRPM() {
        // Bot skill controls how close to redline it shifts
        let variance = Phaser.Math.Between(-1000, 1000) * (1 - this.skill);
        return Phaser.Math.Clamp(this.redline + variance, 7000, this.maxRPM);
    }

    update(delta, elapsed) {
        // Always accelerating
        if (this.gearSystem.currentGear > 0) {
            const rpmBuildRate = 2470 * (this.gearSystem.getGearRatio() / 2.47);
            this.rpm += rpmBuildRate * (delta / 1000);
            if (this.rpm > this.maxRPM) this.rpm = this.maxRPM;
        }

        // Auto-shift logic
        if (this.rpm >= this.nextShiftRPM) {
            if (this.gearSystem.shiftUp()) {
                console.log(`Bot (${this.skill}) shifted up at ${this.rpm.toFixed(0)} RPM`);
                const lastRpmBeforeShift = this.rpm;

                // Perfect shift chance based on bot skill
                const perfectShiftChance = this.skill; // e.g., skill 0.8 = 80% chance
                const isWithinPerfectRange = lastRpmBeforeShift >= 8250 && this.lastRpmBeforeShift <= 8750

                if (Math.random() < perfectShiftChance && isWithinPerfectRange) {
                    this.speed *= 1.02; // same reward as player
                }

                // Normal gear transition
                this.rpm *= 0.6;
                this.acceleration *= 0.7;
                this.nextShiftRPM = this.getRandomShiftRPM();
            }
        }

        // Nitrous decision (once per race, between 40–70% distance)
        if (!this.nitrousUsed && this.distance > Phaser.Math.Between(400, 700)) {
            this.activateNitrous();
            this.nitrousUsed = true;
        }

        // Apply nitrous if active
        if (this.nitrousActive) {
            this.acceleration *= this.nitrousBoost;
            this.rpm += 500 * (delta / 1000);
            if (this.rpm > this.maxRPM) this.rpm = this.maxRPM;
        }

        // Acceleration calc
        const torque = (this.rpm / this.maxRPM) * 15;
        this.acceleration = torque * this.gearSystem.getGearRatio();

        const maxSpeedPerGear = 290 / this.gearSystem.getGearRatio();
        if (this.speed > maxSpeedPerGear) this.speed = maxSpeedPerGear;

        if (this.rpm >= this.maxRPM) {
            const t = this.scene.time.now * 0.02;
            this.rpm = this.maxRPM - 150 * Math.abs(Math.sin(t));
        }

        // Speed update
        this.speed += this.acceleration * (delta / 1000);

        // Track stats
        if (this.speed > this.topSpeed) this.topSpeed = this.speed;
        if (this.zeroToHundredTime === null && this.speed >= 100) {
            this.zeroToHundredTime = elapsed;
        }
        this.distance += this.speed * (delta / 1000);
    }

    activateNitrous() {
        if (!this.nitrousActive && this.nitrousCooldown <= 0) {
            this.nitrousActive = true;
            this.nitrousCooldown = this.nitrousDuration + 5000;
            this.scene.time.delayedCall(this.nitrousDuration, () => {
                this.nitrousActive = false;
            });
        }
    }

    getSpeed() { return this.speed.toFixed(1); }
    getRPM() { return this.rpm.toFixed(0); }
    getcurrentGear() { return this.gearSystem.currentGear; }
    getTopSpeed() { return this.topSpeed.toFixed(1); }
}
