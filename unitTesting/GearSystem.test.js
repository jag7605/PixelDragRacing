import GearSystem from '../js/gameplay/GearSystem.js';

describe('GearSystem', () => {
  let gearSystem;

  beforeEach(() => {
    gearSystem = new GearSystem();
  });

  test('initializes in gear 1 with correct ratio', () => {
    expect(gearSystem.currentGear).toBe(1);
    expect(gearSystem.getGearRatio()).toBe(2.47);
  });

  test('shiftUp increases gear and returns true until maxGears (6)', () => {
    expect(gearSystem.shiftUp()).toBe(true);
    expect(gearSystem.currentGear).toBe(2);
    expect(gearSystem.getGearRatio()).toBe(1.85);

    expect(gearSystem.shiftUp()).toBe(true);
    expect(gearSystem.shiftUp()).toBe(true);
    expect(gearSystem.shiftUp()).toBe(true);
    expect(gearSystem.shiftUp()).toBe(true);
    expect(gearSystem.currentGear).toBe(6);
    expect(gearSystem.getGearRatio()).toBe(1.04);

    expect(gearSystem.shiftUp()).toBe(false);
    expect(gearSystem.currentGear).toBe(6);
  });

  test('shiftDown decreases gear and returns true until min gear 1', () => {
    gearSystem.currentGear = 4;

    expect(gearSystem.shiftDown()).toBe(true);
    expect(gearSystem.currentGear).toBe(3);
    expect(gearSystem.getGearRatio()).toBe(1.49);

    expect(gearSystem.shiftDown()).toBe(true);
    expect(gearSystem.shiftDown()).toBe(true);
    expect(gearSystem.currentGear).toBe(1);

    expect(gearSystem.shiftDown()).toBe(false);
    expect(gearSystem.currentGear).toBe(1);
  });
});