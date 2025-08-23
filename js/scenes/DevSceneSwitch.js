export default class DevSceneSwitch extends Phaser.Scene {
    constructor() {
        super('DevSceneSwitch'); // Consistent key
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        console.log('DevSceneSwitch created'); // Debug log

        const scenes = [
            'BootScene',
            'EndScene',
            'MenuScene',
            'PauseScene',
            'RaceScene'
        ];

        let y = this.cameras.main.height / 4;

        scenes.forEach(sceneKey => {
            const button = this.add.text(
                this.cameras.main.width / 2,
                y,
                `Go to ${sceneKey}`,
                {
                    fontSize: '32px',
                    fill: '#ffffff',
                    backgroundColor: '#333333',
                    padding: { left: 10, right: 10, top: 5, bottom: 5 }
                }
            ).setOrigin(0.5);

            button.setInteractive({ useHandCursor: true });

            button.on('pointerdown', () => {
                this.scene.start(sceneKey);
            });

            y += 100;
        });
    }
}