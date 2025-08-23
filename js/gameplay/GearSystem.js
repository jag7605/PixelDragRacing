// This class manages the gear system for the class
export default class GearSystem {
    // Constructor initializes the gear system
    constructor() {
        this.currentGear = 1; // Start in first gear
        this.maxGears = 5; // Maximum number of gears
        // Gear ratios that affect acceleration and speed. 
        this.gearRatios = [0, 3.5, 2.5, 1.8, 1.4, 1.1]; // Index 0 is unused, gears start from index 1. Will play around with these values later to find a good balance
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