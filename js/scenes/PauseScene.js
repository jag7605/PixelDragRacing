export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        // basic text to confirm scene loads
        this.add.text(640, 360, 'Pause Scene (Work In Progress)', { fontSize: '32px' }).setOrigin(0.5);
    }
}