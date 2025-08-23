export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // basic text to confirm scene loads
        this.add.text(640, 360, 'Boot Scene (Work In Progress)', { fontSize: '32px' }).setOrigin(0.5);
    }
}