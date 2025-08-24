// Import gear system for managing car gears
import GearSystem from './GearSystem.js';

// This class represents a car in the game, handling its movement and gear system
export default class Car {
    constructor(scene, x, y) { // scene is the Phaser scene, x and y are the initial position of the car
        this.scene = scene; // Reference to the Phaser scene
        this.sprite = scene.add.sprite(x, y, 'car').setScale(1); // Create the car sprite at position (x, y) using the 'car' sprite sheet

        if (scene.anims.exists('drive')) { // if the 'drive' animation exists in the scene,
            this.sprite.play('drive'); // play the 'drive' animation on the car sprite
        }

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

        // Gear shifting
        if (Phaser.Input.Keyboard.JustDown(shiftUpKey)) { // if the shift up key is pressed,
            if (this.gearSystem.shiftUp()) { // shift into the next gear
                this.rpm *= 0.4; // Drop RPM on upshift (going to a higher gear means lower RPM)
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

        // Add a subtle bounce effect if RPM exceeds maxRPM
        if (this.rpm >= this.maxRPM) {
            // Subtle visual bounce: vary within ~150 RPM envelope (no gameplay penalty)
            const t = this.scene.time.now * 0.02; // time-based wobble
            this.rpm = this.maxRPM - 150 * Math.abs(Math.sin(t));
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
            this.acceleration *= 0.4; // Reduce acceleration rate if over redline. (Added further penalty to make it more skillful)
        }

        // Update speed based on acceleration and whether the car is accelerating (user pressing the up arrow key)
        if (this.isAccelerating) {
            this.speed += this.acceleration * (delta / 1000); // Increase speed based on acceleration and time since last frame
        } else {
            this.speed *= 0.97; // Slightly increased deceleration for realism
            // (can play with this value and find a sweet spot later)
        }

        // Limit speed based on gear ratio (lower gears allow for more acceleration but less top speed)
        const maxSpeedPerGear = 290 / this.gearSystem.getGearRatio(); // Slightly increased max speed base
        // Example: The top speed in gear 1 is 290 / 2.47 = 117.5 km/h, in gear 2 is 290 / 1.85 = 156.8 km/h, etc.
        if (this.speed > maxSpeedPerGear) this.speed = maxSpeedPerGear;

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
    }

    // Method to get current speed for HUD
    getSpeed() {
        return this.speed.toFixed(1);
    }

    // Method to get current RPM for HUD
    getRPM() {
        return this.rpm.toFixed(0);
    }
}