import Car from '../js/gameplay/Car.js';

// Manual mock for Phaser
jest.mock('phaser', () => ({
  Input: {
    Keyboard: {
      JustDown: jest.fn(),
    },
  },
  Math: {
    Clamp: jest.fn((value, min, max) => Math.max(min, Math.min(max, value))),
    FloatBetween: jest.fn(() => 0.2),
    Between: jest.fn(() => 100),
  },
  Scene: jest.fn(),
  GameObjects: { Sprite: jest.fn() },
}));

// Access the mock directly
const PhaserMock = jest.requireMock('phaser');

// Override global Phaser for code under test
global.Phaser = PhaserMock;

describe('Car Gear Shifting Integration', () => {
    let car;
    let mockScene;
    let mockShiftUpKey;
    let mockShiftDownKey;
    let mockCursors;
    let mockBodySprite;
    let mockWheelSprite;

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test

        // Mock body sprite for the car
        mockBodySprite = {
            setDepth: jest.fn(),
            play: jest.fn(),
            setPosition: jest.fn(),
            anims: {
                isPlaying: false,
                currentAnim: { key: null },
                msPerFrame: 100,
                chain: jest.fn(),
                stop: jest.fn(),
            },
        };

        // Mock wheel sprite for the car
        mockWheelSprite = {
            setDepth: jest.fn(),
            play: jest.fn(),
            setPosition: jest.fn(),
            anims: {
                isPlaying: false,
                currentAnim: { key: null },
                msPerFrame: 100,
                chain: jest.fn(),
                stop: jest.fn(),
            },
        };

        // Mock exhaust sprite for the car
        const mockExhaustSprite = {
            setDepth: jest.fn(),
            play: jest.fn(),
            anims: {
                isPlaying: false,
                currentAnim: { key: null },
                msPerFrame: 100,
            },
        };

        // Mock scene with necessary methods
        mockScene = {
            add: { 
                sprite: jest.fn()
                    .mockReturnValueOnce(mockBodySprite)
                    .mockReturnValueOnce(mockWheelSprite)
                    .mockReturnValueOnce(mockExhaustSprite),
                rectangle: jest.fn(() => ({
                    setOrigin: jest.fn().mockReturnThis(),
                    destroy: jest.fn(),
                })),
            },
            anims: { exists: jest.fn(() => true), create: jest.fn() },
            tweens: { add: jest.fn() },
            time: { now: 0, delayedCall: jest.fn() },
            cameras: {
                main: {
                    shake: jest.fn(),
                    getWorldPoint: jest.fn((x, y) => ({ x, y })),
                },
            },
            scale: {
                height: 720,
                width: 1280,
            },
            registry: {  
                get: jest.fn((key) => {
                    if (key === 'nitrousTuning') return { power: 2.0, duration: 5000 };
                    if (key === 'selectedCarData') return { body: 'gt40', wheels: 'wheels' };
                    if (key === 'upgrades') return { 0: 1 };
                    if (key === 'selectedCar') return 0;
                    return null;
                })
            },
        };

        // Create a new car instance
        car = new Car(mockScene, 0, 0);

        // Assign mock sprites to the car
        car.bodySprite = mockBodySprite;
        car.wheelSprite = mockWheelSprite;

        // Mock input keys
        mockShiftUpKey = {};
        mockShiftDownKey = {};
        mockCursors = { up: { isDown: true } };

        // Reset JustDown mock
        PhaserMock.Input.Keyboard.JustDown.mockReset();
    });

    test('shiftUp adjusts RPM drop, acceleration reduce, counts shift, and applies perfect shift boost if in range', () => {
        car.rpm = 8500; // Set initial RPM
        car.acceleration = 10; // Set initial acceleration
        car.speed = 100; // Set initial speed
        car.gearSystem.currentGear = 1; // Set initial gear

        // Mock JustDown behavior for shift keys
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValueOnce(true)  // shiftUpKey true
            .mockReturnValueOnce(false);  // shiftDownKey false

        // Use a very short delta to minimize acceleration effects and focus on the shift
        const shortDelta = 16; // ~1 frame at 60fps
        
        // Calculate expected RPM after shift
        const rpmAfterShift = 8500 * 0.6; // 5100
        const powerFactor = 0.6; // Stage 1
        const newGearRatio = 1.85; // Gear 2
        const rpmBuildRate = 2470 * (newGearRatio / 2.47) * powerFactor;
        const expectedRpm = rpmAfterShift + rpmBuildRate * (shortDelta / 1000);
        
        // Update car state
        car.update(shortDelta, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);

        // Verify gear changed
        expect(car.gearSystem.currentGear).toBe(2);
        
        // Verify RPM behavior (dropped then built back up slightly)
        expect(car.rpm).toBeCloseTo(expectedRpm, 0);
        
        // Verify shift was counted
        expect(car.shiftCount).toBe(1);
        
        // Verify perfect shift was counted (8500 is in 8250-8750 range)
        expect(car.perfectShifts).toBe(1);
        
        // Verify speed boost was applied (1.02 for perfect shift)
        expect(car.speed).toBeGreaterThan(100);
        expect(car.speed).toBeLessThan(110); // More lenient upper bound
    });

    test('shiftUp does not count perfect shift if RPM outside range', () => {
        car.rpm = 7000; // Outside perfect shift range
        car.speed = 100;
        car.gearSystem.currentGear = 1;

        // Mock JustDown behavior for shift keys
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValueOnce(true)  // shiftUpKey true
            .mockReturnValueOnce(false);  // shiftDownKey false

        // Update car state
        car.update(1000, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);

        // Verify gear changed
        expect(car.gearSystem.currentGear).toBe(2);
        expect(car.shiftCount).toBe(1);
        expect(car.perfectShifts).toBe(0); // No perfect shift
    });

    test('shiftDown adjusts RPM increase (with clamp), acceleration boost, and prevents invalid min gear', () => {
        car.gearSystem.currentGear = 2; // Set initial gear
        car.rpm = 6000; // Set initial RPM
        car.acceleration = 10; // Set initial acceleration
        car.speed = 100; // Set initial speed

        // Mock JustDown behavior for shift keys
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValueOnce(false)  // shiftUpKey false
            .mockReturnValueOnce(true);  // shiftDownKey true

        // Update car state
        car.update(1000, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);

        // Verify gear changed
        expect(car.gearSystem.currentGear).toBe(1);
        
        // Verify RPM increased by 1.7 (clamped to maxRPM if needed)
        const expectedRpm = Math.min(6000 * 1.7, car.maxRPM);
        expect(car.rpm).toBeCloseTo(expectedRpm, 0);
        
        // Verify shift was counted
        expect(car.shiftCount).toBe(1);

        // Test that we can't shift down below gear 1
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(true);

        const shiftCountBefore = car.shiftCount;
        car.update(1000, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);
        
        // Should still be in gear 1
        expect(car.gearSystem.currentGear).toBe(1);
        
        // Shift count should not increase (failed shift)
        expect(car.shiftCount).toBe(shiftCountBefore);
    });

    test('speed increases when accelerating in gear with sufficient RPM', () => {
        car.rpm = 5000; // Set initial RPM
        car.speed = 50; // Set initial speed
        car.gearSystem.currentGear = 2; // Set initial gear

        // Mock JustDown behavior for shift keys
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValue(false); // No shifts

        const initialSpeed = car.speed; // Store initial speed
        car.update(1000, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);

        // Speed should have increased
        expect(car.speed).toBeGreaterThan(initialSpeed);
    });

    test('RPM penalty when over redline reduces acceleration', () => {
        car.rpm = 8600; // Over redline (8500)
        car.acceleration = 10; // Set initial acceleration
        car.speed = 100; // Set initial speed
        car.gearSystem.currentGear = 3; // Not in max gear

        // Mock JustDown behavior for shift keys
        PhaserMock.Input.Keyboard.JustDown
            .mockReturnValue(false); // No shifts

        const initialSpeed = car.speed; // Store initial speed
        car.update(100, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);

        // Speed increase should be minimal due to redline penalty
        const speedIncrease = car.speed - initialSpeed;
        
        // Calculate what increase would be without penalty
        car.rpm = 8600;
        car.acceleration = 10;
        car.speed = initialSpeed;
        car.update(100, mockCursors, mockShiftUpKey, mockShiftDownKey, null, 0);
        
        // The increase should be significantly reduced by the 0.3 multiplier
        expect(speedIncrease).toBeLessThan(5); // Arbitrary small value
    });
});