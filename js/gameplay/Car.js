// Import gear system for managing car gears and nitrous mini-game for boost activation
import GearSystem from './GearSystem.js';
import NitrousMiniGame from './NitrousMiniGame.js';

// This class represents a car in the game, handling its movement and gear system
export default class Car {
    constructor(scene, x, y, upgradeStage = 1) { // scene is the Phaser scene, x and y are the initial position of the car, upgradeStage indicates the level of upgrades (1, 2, or 3)
        this.scene = scene; // Reference to the Phaser scene
        this.x = x;
        this.y = y;
        this.upgradeStage = upgradeStage;  // Store stage of upgrades (1, 2, or 3)

        // Set initial car properties
        this.speed = 0; // Initial speed of the car set to 0
        this.gearSystem = new GearSystem(); // Create a new instance of the GearSystem to manage the car's gears
        this.rpm = 800; // Start at idle RPM
        this.maxRPM = 9000; // Maximum RPM the car can reach
        this.redline = 8500; // RPM at which the car starts to lose power (user would have to shift up before this to avoid this which adds a skill element)
        this.acceleration = 0; // Initial acceleration set to 0
        this.isAccelerating = false; // Flag to check if the car is accelerating

        // Set nitrous speed boost properties from tuning or default
        const tuning = this.scene.registry.get('nitrousTuning') || { power: 2.0, duration: 5000 };
        this.nitrousActive = false; // Flag to check if nitrous is active
        this.nitrousDuration = tuning.duration; // Tuned duration (e.g., 7500ms, 5000ms, 2500ms)
        this.nitrousCooldown = 0; // Cooldown time after using nitrous (will adjust further down)
        this.nitrousBoost = tuning.power; // Tuned power (e.g., 1.5, 2.0, 2.5)

        // Set up basic stats tracking
        this.zeroToHundredTime = null; // Time taken to go from 0 to 100 km/h (kept null until achieved)
        this.topSpeed = 0; // Track the top speed achieved
        this.distance = 0; // Track distance traveled
        this.shiftCount = 0; // Count of gear shifts made
        this.perfectShifts = 0; // Count of perfect gear shifts made
        this.lastRpmBeforeShift = 0; // Temporary storage for RPM before shift (used for tracking perfect shifts)
    }

    create() {
        const carData = this.scene.registry.get('selectedCarData') || { body: 'gt40', wheels: 'wheels' };

        this.bodySprite = this.scene.add.sprite(640, 360, carData.body);
        this.wheelSprite = this.scene.add.sprite(640, 360, carData.wheels);
    }

    // This method updates the car's position and speed based on input
    // delta is the time since the last frame in milliseconds, cursors is the input for movement, 
    // shiftUpKey and shiftDownKey are for gear shifting, nitrousKey for boost, elapsed for timing stats
    update(delta, cursors, shiftUpKey, shiftDownKey, nitrousKey, elapsed) {
        if (!cursors || !cursors.up) return; // If cursors or the up key is not defined, exit the update method early to prevent errors.

        // play the drive animation only if the car is moving (speed > 0)
        if (this.speed > 0) {
            if (!this.bodySprite.anims.isPlaying || this.bodySprite.anims.currentAnim.key !== 'driveBody') {
                if (this.scene.anims.exists('driveBody')) this.bodySprite.play('driveBody');
            }
            if (!this.wheelSprite.anims.isPlaying || this.wheelSprite.anims.currentAnim.key !== 'driveWheels') {
                if (this.scene.anims.exists('driveWheels')) this.wheelSprite.play('driveWheels');
            }
        }

        // increase the animation speed based on the car's speed for a more dynamic effect
        if (this.bodySprite.anims.isPlaying && this.bodySprite.anims.currentAnim.key === 'driveBody') {
            const animSpeed = Phaser.Math.Clamp(this.speed / 100, 0.5, 3);
            this.bodySprite.anims.msPerFrame = 1000 / (10 * animSpeed);
        }

        // Gear shifting
        if (Phaser.Input.Keyboard.JustDown(shiftUpKey)) { // if the shift up key is pressed,
            this.lastRpmBeforeShift = this.rpm; // Store RPM before shift
            if (this.gearSystem.shiftUp()) { // shift into the next gear
                this.shiftCount++; // Increase the shift count
                // Check for perfect shift (within 8250-8750 RPM before shift)
                if (this.lastRpmBeforeShift >= 8250 && this.lastRpmBeforeShift <= 8750) {
                    this.perfectShifts++; // Increase perfect shift count
                    // Add small speed boost for perfect shift
                    this.speed *= 1.02; // 2% speed boost for perfect shift
                }
                this.rpm *= 0.6; // Drop RPM on upshift (going to a higher gear means lower RPM)
                this.acceleration *= 0.7; // Reduce acceleration curve after upshift
            }
        }
        if (Phaser.Input.Keyboard.JustDown(shiftDownKey)) { // if the shift down key is pressed,
            if (this.gearSystem.shiftDown()) { // shift into the previous gear
                this.shiftCount++; // Increase the shift count
                this.rpm *= 1.7; // Increase RPM on downshift (going to a lower gear means higher RPM)
                if (this.rpm > this.maxRPM) this.rpm = this.maxRPM; // This is to make sure that the RPM does not go past the maximum after downshifting
                this.acceleration *= 1.2; // Increase acceleration curve after downshift
            }
        }

        // Calculate acceleration based on RPM and gear. Added powerFactor to scale with upgrade stage.
        let torque;
        const powerFactor = [0, 0.6, 1.0, 1.4][this.upgradeStage];  // Custom scale: 0.6 for stage 1, 1.0 for 2, 1.4 for 3
        if (this.upgradeStage === 1) {
            torque = (this.rpm / this.maxRPM) * 18 * powerFactor;  // Stage 1: Base 18, scaled to 10.8
        } else if (this.upgradeStage === 2) {
            torque = (this.rpm / this.maxRPM) * 15 * powerFactor;  // Stage 2: Base 15, scaled to 15.0
        } else {
            torque = (this.rpm / this.maxRPM) * 22 * powerFactor;  // Stage 3: Base 22, scaled to 30.8
        }

        this.acceleration = torque * this.gearSystem.getGearRatio();

        // Acceleration with RPM build rate scaled by powerFactor
        this.isAccelerating = cursors.up.isDown;
        if (this.isAccelerating && this.gearSystem.currentGear > 0) {
            const rpmBuildRate = 2470 * (this.gearSystem.getGearRatio() / 2.47) * powerFactor;  // Scale RPM build
            this.rpm += rpmBuildRate * (delta / 1000);
            if (this.rpm > this.maxRPM) this.rpm = this.maxRPM;
        } else {
            this.rpm -= 1200 * (delta / 1000); // Reduced decay rate for smoother idle return
            if (this.rpm < 800) this.rpm = 800; // Idle RPM
        }

        // Scale base speed by upgrade stage (all stages have the same top speed, only acceleration (torque) is improved through upgrades)
        const maxSpeedTops = [0, 280, 280, 280];  // Cap at 280 to match speedometer
        const maxSpeedBase = maxSpeedTops[this.upgradeStage] * 1.04;  // e.g., 280 * 1.04 ≈ 291.2
        const maxSpeedPerGear = maxSpeedBase / this.gearSystem.getGearRatio();
        if (this.speed > maxSpeedPerGear) this.speed = maxSpeedPerGear;

        // Add a subtle bounce effect if RPM exceeds maxRPM
        if (this.rpm >= this.maxRPM) {
            // Subtle visual bounce: vary within ~150 RPM envelope (no gameplay penalty)
            const t = this.scene.time.now * 0.02; // time-based wobble
            this.rpm = this.maxRPM - 150 * Math.abs(Math.sin(t));
        }

        // add the same bounce effect to speed when at max speed for visual feedback
        if (this.speed >= maxSpeedPerGear) {
            const t = this.scene.time.now * 0.02; // time-based wobble
            this.speed = maxSpeedPerGear - 2 * Math.abs(Math.sin(t)); // small speed wobble 
        }

        // Apply nitrous boost if active
        if (this.nitrousActive) {
            this.acceleration *= this.nitrousBoost; // Multiply acceleration by nitrous boost factor
            this.rpm += 500 * (delta / 1000);
            if (this.rpm > this.maxRPM) this.rpm = this.maxRPM;
        }

        // Penalty if over redline (without shifting). 
        // This simulates the car losing power if it goes over the redline RPM which is a common mechanic in racing games.
        // This is a skill element that encourages the player to find the perfect time shift up before hitting the redline to maintain speed.
        if (this.rpm > this.redline && this.gearSystem.currentGear < this.gearSystem.maxGears) {
            this.acceleration *= 0.3; // Reduce acceleration rate if over redline. (Added further penalty to make it more skillful)
        }

        // Update speed based on acceleration and whether the car is accelerating (user pressing the up arrow key)
        if (this.isAccelerating) {
            this.speed += this.acceleration * (delta / 1000); // Increase speed based on acceleration and time since last frame
        } else {
            // Natural deceleration when not accelerating
            // (changed from previous logic to a more realistic drag-based deceleration)
            const dragCoeff = 0.0001; // Small coefficient for slow, realistic coasting (can be tuned as needed)
            const deceleration = dragCoeff * this.speed * delta; // Deceleration proportional to current speed
            this.speed = Math.max(0, this.speed - deceleration); // Ensure speed doesn't go negative
            // (can alter dragCoeff for more or less coasting effect, lower value = more coasting, higher value = quicker stop)
        }

        // Handle nitrous activation
        // In update(), replace the nitrous activation block
        if (Phaser.Input.Keyboard.JustDown(nitrousKey) && !this.nitrousActive && this.nitrousCooldown <= 0) {
            // Start mini-game instead of direct activation
            const miniGame = new NitrousMiniGame(this.scene, (isSuccess) => {
                if (isSuccess) {
                    this.nitrousActive = true;
                    this.nitrousCooldown = this.nitrousDuration + 5000;  // Existing cooldown
                    this.scene.time.delayedCall(this.nitrousDuration, () => {
                        this.nitrousActive = false;
                    });
                } else {
                    this.nitrousCooldown = 5000;  // Reset cooldown upon failing the minigame
                }
            });
        }

        if (this.nitrousCooldown > 0) { // if the nitrous cooldown is active,
            this.nitrousCooldown -= delta; // reduce the cooldown by the time since last frame
            if (this.nitrousCooldown < 0) this.nitrousCooldown = 0; // reset cooldown to 0 if it goes below 0
        }

        // Update the top speed stat if the current speed exceeds it
        if (this.speed > this.topSpeed) this.topSpeed = this.speed;

        // Track the time taken to go from 0 to 100
        if (this.zeroToHundredTime === null && this.speed >= 100) {
            this.zeroToHundredTime = elapsed;
        }

        // Track distance traveled (will be used to set race length later)
        this.distance += this.speed * (delta / 1000);

        // add screen shake effect when nitrous is active for visual feedback
        if (this.nitrousActive) {
            const intensity = 0.005; // Reduced intensity for a more subtle effect
            this.scene.cameras.main.shake(50, intensity); // Short, subtle shake
        }

        // add gradual screen shake based on speed for immersion, capped at high speeds to avoid excessive shaking
        const speedShakeIntensity = Math.min(this.speed / 30000, 0.00075); // Capped intensity
        if (speedShakeIntensity > 0) {
            if (this.speed > 50) {
                this.scene.cameras.main.shake(25, speedShakeIntensity); // Very subtle shake
            }
        }

        // Add horizontal speed lines for visual speed feedback
        if (this.speed > 100) {
            const lineCount = Math.min(Math.floor(this.speed / 50), 10); // More lines with speed, capped at 10
            for (let i = 0; i < lineCount; i++) {
                const lineY = Phaser.Math.Between(0, this.scene.scale.height); // Random Y position
                const screenLeftX = this.scene.cameras.main.getWorldPoint(0, 0).x; // Left edge of camera in world coordinates
                const screenRightX = this.scene.cameras.main.getWorldPoint(this.scene.scale.width, 0).x; // Right edge of camera
                const lineWidth = 0.25 * this.scene.scale.width; // set the line width
                const line = this.scene.add.rectangle(
                    screenRightX, // Spawn at far right edge of camera
                    lineY, // Random Y position
                    lineWidth, // set the line width
                    1, // Thin line for subtle effect
                    0xffffff, // White color for visibility (windshield streak effect)
                    Phaser.Math.FloatBetween(0.1, 0.3) // Random opacity for depth effect
                ).setOrigin(0, 0.5);
                const baseDuration = 600; // Base duration in ms
                const speedFactor = Math.max(100, this.speed); // Minimum 100 km/h to avoid division by zero
                const duration = baseDuration * (100 / speedFactor); // Shorter duration with higher speed
                this.scene.tweens.add({
                    targets: line,
                    x: screenLeftX - lineWidth, // Move to off-screen left
                    duration: Phaser.Math.Between(duration * 0.8, duration * 1.2), // Slight random variation
                    ease: 'Linear',
                    onComplete: () => line.destroy() // Remove line after animation
                });
            }
        }

        // Add more horizontal speed lines if nitrous is active for extra effect (these lines are longer and more visible)
        if (this.nitrousActive) {
            const nitrousLineCount = 3; // Fixed number of lines for nitrous effect
            for (let i = 0; i < nitrousLineCount; i++) {
                const lineY = Phaser.Math.Between(300, this.scene.scale.height); // Random Y position
                const screenLeftX = this.scene.cameras.main.getWorldPoint(0, 0).x; // Left edge of camera in world coordinates
                const screenRightX = this.scene.cameras.main.getWorldPoint(this.scene.scale.width, 0).x; // Right edge of camera
                const lineWidth = 0.5 * this.scene.scale.width; // 75% of screen width for shorter lines
                const line = this.scene.add.rectangle(
                    screenRightX, // Spawn at far right edge of camera
                    lineY,
                    lineWidth,
                    2,
                    0xffffff,
                    Phaser.Math.FloatBetween(0.2, 0.5) // Slightly higher opacity for visibility
                ).setOrigin(0, 0.5);
                const baseDuration = 400; // Base duration for nitrous
                const speedFactor = Math.max(100, this.speed); // Minimum 100 km/h
                const duration = baseDuration * (100 / speedFactor); // Faster with higher speed
                this.scene.tweens.add({
                    targets: line,
                    x: screenLeftX - lineWidth, // Move to off-screen left
                    duration: Phaser.Math.Between(duration * 0.8, duration * 1.2), // Slight random variation
                    ease: 'Linear',
                    onComplete: () => line.destroy() // Remove line after animation
                });
            }
        }

        // make it so you can view shifts, perfect shifts and shift percentage in the console for testing 
        console.log(`Shifts: ${this.shiftCount}, Perfect Shifts: ${this.perfectShifts}, Perfect Shift %: ${this.getPerfectShiftPercentage()}`);
    }

    // Method to get current speed for HUD
    getSpeed() {
        return this.speed.toFixed(1);
    }

    // Method to get current RPM for HUD 
    getRPM() {
        return this.rpm.toFixed(0);
    }

    // Method to get current gear for HUD
    getcurrentGear() {
        return this.gearSystem.currentGear;
    }

    // method to return top speed
    getTopSpeed() {
        return this.topSpeed.toFixed(1);
    }

    // method to return 0-100 time in seconds
    getZeroToHundredTime() {
        return this.zeroToHundredTime ? (this.zeroToHundredTime / 1000).toFixed(2) : null; // Convert to seconds and format to 2 decimal places
    }

    // method to return distance traveled
    getDistance() {
        return this.distance.toFixed(1); // Distance traveled formatted to 1 decimal place
    }

    // method to return total number of shifts
    getShiftCount() {
        return this.shiftCount;
    }

    // method to return total number of perfect shifts
    getPerfectShifts() {
        return this.perfectShifts;
    }

    // method to return perfect shift percentage
    getPerfectShiftPercentage() {
        if (this.shiftCount === 0) return '0.00'; // Avoid division by zero
        const percentage = (this.perfectShifts / this.shiftCount) * 100;
        return percentage.toFixed(2); // Format to 2 decimal places
    }

    // method to reset car properties on race restart
    reset(x, y) {
        this.speed = 0; // reset speed to 0
        this.gearSystem.reset; // reset the gear system 
        this.rpm = 800; // reset RPM to idle
        this.acceleration = 0; // reset acceleration to 0
        this.isAccelerating = false; // reset acceleration flag
        this.zeroToHundredTime = null; // reset 0-100 time
        this.topSpeed = 0; // reset top speed
        this.distance = 0; // reset distance traveled
        this.nitrousActive = false; // reset nitrous flag
        this.nitrousCooldown = 0; // reset nitrous cooldown
        this.shiftCount = 0; // reset shift count
        this.perfectShifts = 0; // reset perfect shift count
        this.lastRpmBeforeShift = 0; // reset last RPM before shift
        this.upgradeStage = this.scene.registry.get('upgrades')[this.scene.registry.get('selectedCar')] || 1;  // Reload if needed
        this.bodySprite.setPosition(x, y);
        this.wheelSprite.setPosition(x, y);
    }
}