// This class manages the gear system for the class
export default class GearSystem {
    // Constructor initializes the gear system
    constructor() {
        this.currentGear = 1; // Start in first gear
        this.maxGears = 6; // Maximum number of gears
        // Gear ratios that affect acceleration and speed. 
        this.gearRatios = [0, 2.47, 1.85, 1.49, 1.26, 1.12, 1.04]; // Index 0 is unused, gears start from index 1. Will play around with these values later to find a good balance
    }

    // Method to shift up. Will return true if successful, false if already in highest gear
    shiftUp() {
        if (this.currentGear < this.maxGears) {
            this.currentGear++;
            return true;
        }
        return false;
    }

    // Method to shift down. Will return true if successful, false if already in lowest gear
    shiftDown() {
        if (this.currentGear > 1) {
            this.currentGear--;
            return true;
        }
        return false;
    }

    // Method to get the current gear ratio based on the current gear. 
    // This will be used to calculate speed and acceleration in the Car class.
    getGearRatio() {
        return this.gearRatios[this.currentGear];
    }
}