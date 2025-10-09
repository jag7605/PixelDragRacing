export default class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(0.7);

        // paused text
        this.add.bitmapText(645, 155, 'pixelFont', 'PAUSED', 40).setOrigin(0.5);

        const raceScene = this.scene.get('RaceScene');
        
        //resume button
        const resumeButton = this.createButton(640, 440, 'btn_resume', 0.6, () => {
            if (raceScene.raceStarted) {
                const pauseDuration = this.time.now - raceScene.pauseStartTime;
                raceScene.totalPausedTime += pauseDuration;
            }
            this.scene.stop();            
            this.scene.resume('RaceScene');
        });

        //resume text
        this.add.bitmapText(640, 440, 'pixelFont', 'RESUME', 32).setOrigin(0.5);

        // settings button
        const settingsButton = this.createButton(450, 300, 'btn_settings', 0.6, () => {
            this.scene.launch('SettingsScene');
            //bring to top
            this.scene.bringToTop('SettingsScene');
        });

        // Main Menu button

        const menuButton = this.createButton(640, 300, 'menu', 0.5, () =>{
            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
            }
            this.scene.stop();            // Stop PauseScene
            this.scene.launch('MenuScene'); // Go to main menu scene
            this.scene.stop('RaceScene'); // Stop game scene
        });


        // Restart button
        const restartButton = this.createButton(830, 300, 'replay', 0.5, () => {
            //stop music
            if (raceScene.bgMusic) {
                raceScene.bgMusic.stop();
            }
            this.scene.stop();            // Stop PauseScene
            this.scene.launch('RaceScene'); // Restart game scene
        });

        // Music toggle button
        this.createToggleButton(545, 560, 'music', 0.3, 'musicMuted', (muted) => {
            if (raceScene.bgMusic) {
                if (muted) raceScene.bgMusic.pause();
                else raceScene.bgMusic.resume();
            }
        });

        //sound button
        this.createToggleButton(735, 560, 'sound', 0.35, 'sfxMuted');


        //info button
        const infoButton = this.createButton(640, 560, 'info', 0.3, () => {
            this.scene.launch('InfoScene');
            //bring to top
            this.scene.bringToTop('InfoScene');
        });
    }

    // Helper to create buttons
    createButton(x, y, key, scale, onClick) {
        const btn = this.add.image(x, y, key)
            .setOrigin(0.5)
            .setInteractive()
            .setScale(scale);

        // Hover effects
        btn.on('pointerover', () => btn.setTint(0x888888));
        btn.on('pointerout', () => btn.clearTint());

        // Click sound + custom action
        btn.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            onClick?.(); // only call if provided
        });

        return btn;
    }

    //helper for toggle buttons
    createToggleButton(x, y, key, scale, registryKey, onToggle) {
        const btn = this.add.image(x, y, key)
            .setOrigin(0.5)
            .setInteractive()
            .setScale(scale);

        // Cross line
        const line = this.add.graphics();
        line.lineStyle(5, 0xff0000, 1).moveTo(-25, -25).lineTo(25, 25).strokePath();
        line.setPosition(btn.x, btn.y);

        let state = this.registry.get(registryKey) || false;
        line.setVisible(state);

        btn.on('pointerover', () => btn.setTint(0x888888));
        btn.on('pointerout', () => btn.clearTint());

        btn.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            state = !state;
            this.registry.set(registryKey, state);
            line.setVisible(state);
            if (state) btn.setTint(0xff0000);
            else btn.clearTint();
            onToggle?.(state); // callback to handle extra logic
        });

        return { btn, line };
    }

}