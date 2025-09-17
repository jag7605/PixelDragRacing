// Import gear system for managing car gears
import GearSystem from './GearSystem.js';

// This class represents a car in the game, handling its movement and gear system
export default class Car {
    constructor(scene, x, y) { // scene is the Phaser scene, x and y are the initial position of the car
        this.scene = scene; // Reference to the Phaser scene
        this.sprite = scene.add.sprite(x, y, 'car').setScale(1); // Create the car sprite at position (x, y) using the 'car' sprite sheet

        // Set initial car properties
        this.speed = 0; // Initial speed of the car set to 0
        this.gearSystem = new GearSystem(); // Create a new instance of the GearSystem to manage the car's gears
        this.rpm = 800; // Start at idle RPM
        this.maxRPM = 9000; // Maximum RPM the car can reach
        this.redline = 8500; // RPM at which the car starts to lose power (user would have to shift up before this to avoid this which adds a skill element)
        this.acceleration = 0; // Initial acceleration set to 0
        this.isAccelerating = false; // Flag to check if the car is accelerating

        // Set nitrous speed boost properties
        this.nitrousActive = false; // Flag to check if nitrous is active
        this.nitrousDuration = 3000; // Nitrous lasts for 3 seconds. (I will most likey adjust this later and find a sweet spot)
        this.nitrousCooldown = 0; // Cooldown time after using nitrous (will adjust further down)
        this.nitrousBoost = 1.8; // Increased speed multiplier for more noticeable boost

        // Set up basic stats tracking
        this.zeroToHundredTime = null; // Time taken to go from 0 to 100 km/h (kept null until achieved)
        this.topSpeed = 0; // Track the top speed achieved
        this.distance = 0; // Track distance traveled
    }

    // This method updates the car's position and speed based on input
    // delta is the time since the last frame in milliseconds, cursors is the input for movement, 
    // shiftUpKey and shiftDownKey are for gear shifting, nitrousKey for boost, elapsed for timing stats
    update(delta, cursors, shiftUpKey, shiftDownKey, nitrousKey, elapsed) {
        if (!cursors || !cursors.up) return; // If cursors or the up key is not defined, exit the update method early to prevent errors.

        // play the drive animation only if the car is moving (speed > 0)
        if (this.speed > 0) {
            if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== 'drive') {
                if (this.scene.anims.exists('drive')) { // Check if the 'drive' animation exists
                    this.sprite.play('drive'); // Play the 'drive' animation
                }
            }
        }

        // increase the animation speed based on the car's speed for a more dynamic effect
        if (this.sprite.anims.isPlaying && this.sprite.anims.currentAnim.key === 'drive') {
            const animSpeed = Phaser.Math.Clamp(this.speed / 100, 0.5, 3); // Clamp animation speed between 0.5 and 3
            this.sprite.anims.msPerFrame = 1000 / (10 * animSpeed); // Adjust msPerFrame based on speed
        }

        // Gear shifting
        if (Phaser.Input.Keyboard.JustDown(shiftUpKey)) { // if the shift up key is pressed,
            if (this.gearSystem.shiftUp()) { // shift into the next gear
                this.rpm *= 0.6; // Drop RPM on upshift (going to a higher gear means lower RPM)
                this.acceleration *= 0.7; // Reduce acceleration curve after upshift
            }
        }
        if (Phaser.Input.Keyboard.JustDown(shiftDownKey)) { // if the shift down key is pressed,
            if (this.gearSystem.shiftDown()) { // shift into the previous gear
                this.rpm *= 1.7; // Increase RPM on downshift (going to a lower gear means higher RPM)
                if (this.rpm > this.maxRPM) this.rpm = this.maxRPM; // This is to make sure that the RPM does not go past the maximum after downshifting
                this.acceleration *= 1.2; // Increase acceleration curve after downshift
            }
        }

        // Acceleration
        this.isAccelerating = cursors.up.isDown; // if the up arrow key is pressed,
        if (this.isAccelerating && this.gearSystem.currentGear > 0) {
            // RPM build rate per second, scaled by gear ratio for realistic feel
            const rpmBuildRate = 2470 * (this.gearSystem.getGearRatio() / 2.47); // rpm build rate based on gear ratio value
            this.rpm += rpmBuildRate * (delta / 1000); // RPM build rate per second
            if (this.rpm > this.maxRPM) this.rpm = this.maxRPM; // Limit the RPM to the maximum while accelerating 
        } else {
            this.rpm -= 1200 * (delta / 1000); // Reduced decay rate for smoother idle return
            if (this.rpm < 800) this.rpm = 800; // Idle RPM (If a car is on, there has to be some RPM, so this is the minimum I have chosen)
        }

        // Calculate acceleration based on RPM and gear
        const torque = (this.rpm / this.maxRPM) * 15; // Increased torque multiplier for better low-end power
        // The acceleration is calculated by multiplying the torque by the gear ratio, which gives a realistic acceleration value based on the current gear.
        this.acceleration = torque * this.gearSystem.getGearRatio();

        // Limit speed based on gear ratio (lower gears allow for more acceleration but less top speed)
        const maxSpeedPerGear = 290 / this.gearSystem.getGearRatio(); // Slightly increased max speed base
        // Example: The top speed in gear 1 is 290 / 2.47 = 117.5 km/h, in gear 2 is 290 / 1.85 = 156.8 km/h, etc.
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
            // Optional: Add a slight RPM boost during nitrous
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
        if (Phaser.Input.Keyboard.JustDown(nitrousKey) && !this.nitrousActive && this.nitrousCooldown <= 0) { // if the nitrous key is pressed, it isn't already active, and the cooldown is over,
            this.nitrousActive = true; // flip the nitrous active flag to true
            this.nitrousCooldown = this.nitrousDuration + 5000; // Set cooldown to 5 seconds after using nitrous
            this.scene.time.delayedCall(this.nitrousDuration, () => { // after the nitrous duration ends,
                this.nitrousActive = false; // set nitrous active flag to false to disable the speed boost.
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

    // Method to get top speed for stats
    getTopSpeed() {
        return this.topSpeed.toFixed(1);
    }

    // Method to get 0-100 time for stats
    getZeroToHundredTime() {
        return this.zeroToHundredTime ? (this.zeroToHundredTime / 1000).toFixed(2) : null; // Convert to seconds and format to 2 decimal places
    }

    // Method to get distance traveled for stats
    getDistance() {
        return this.distance.toFixed(1); // Distance traveled formatted to 1 decimal place
    }

    // Method to reset car properties on race restart
    reset() {
        this.speed = 0; // reset speed to 0
        this.gearSystem.reset; // reset the gear system 
        this.rpm = 800; // reset RPM to idle
        this.acceleration = 0; // reset acceleration to 0
        this.isAccelerating = false; // reset acceleration flag
        this.zeroToHundredTime = null; // reset 0-100 time
        this.topSpeed = 0; // reset top speed
        this.distance = 0; // reset distance traveled
        this.nitrousActive = false;
    }
}