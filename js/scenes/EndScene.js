export default class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {
        // basic text to confirm scene loads
        this.add.text(640, 360, 'End Scene (Work In Progress)', { fontSize: '32px' }).setOrigin(0.5);
    }
}