export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // basic text to confirm scene loads
        this.add.text(640, 360, 'Menu Scene (Work In Progress)', { fontSize: '32px' }).setOrigin(0.5);
    }
}