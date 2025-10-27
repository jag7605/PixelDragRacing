export default class StatsScene extends Phaser.Scene {
    constructor() {
        super('StatsScene');
    }
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1, 0.6);

        // settings text
        this.add.bitmapText(645, 155, 'pixelFont', 'YOUR STATS', 40).setOrigin(0.5);

        //fetch player data
        let playerData = this.registry.get("playerData");

        //stats text
        const statsText = 
            `Races Played: ${playerData.stats.races}\n` +
            `Races Won: ${playerData.stats.wins}\n` +
            `Races Lost: ${playerData.stats.losses}\n` +
            `Current XP: ${playerData.XP}\n` +
            `Current Level: ${playerData.level}\n` +
            `Total Perfect Shifts: ${playerData.stats.shifts} / ${playerData.stats.totalShifts}\n` +
            `Total Currency Earned: $${playerData.totalCurrencyEarned}\n` +
            `Current Currency: $${playerData.currency}\n` +
            `Cars Unlocked: ${Object.keys(playerData.unlockedCars).length} / 8\n`+
            `Fastest Time: ${playerData.fastestTime ? playerData.fastestTime.toFixed(2) + 's' : 'N/A'}`;

        this.add.bitmapText(640, 370, 'pixelFont', statsText, 22).setOrigin(0.5).setTint(0x852020).setLineSpacing(30);

        // x in corner to close
        const closeButton = this.add.text(1050, 100, 'X', { font: '40px Arial', fill: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(2);
            
        closeButton.on('pointerover', () => {
            closeButton.setStyle({ fill: '#ff0000' });
        });
        closeButton.on('pointerout', () => {
            closeButton.setStyle({ fill: '#ffffff' });
        });

        closeButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            if (this.scene.isPaused('MenuScene')) {
                this.scene.resume('MenuScene');
            }
            if (this.scene.isPaused('PauseScene')) {
                this.scene.resume('PauseScene');
            }

            this.scene.stop();
        });

    }

}