export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(0.7);

        // settings text
        this.add.bitmapText(645, 155, 'pixelFont', 'SETTINGS', 40).setOrigin(0.5);

        // Music toggle button
        this.createToggleButton(450, 300, 'music', 0.5, 'musicMuted', (muted) => {
            if (raceScene.bgMusic) {
                if (muted) raceScene.bgMusic.pause();
                else raceScene.bgMusic.resume();
            }
        });


        //sound button
        this.createToggleButton(830, 300, 'sound', 0.6, 'sfxMuted');


        //info button
        const infoButton = this.createButton(640, 300, 'info', 0.5, () => {
            this.scene.pause();
            this.scene.launch('InfoScene');
            //bring to top
            this.scene.bringToTop('InfoScene');
        });

        //sound volume bar
        const barX = 525;
        const barY = 450;
        const barWidth = 250;
        const barHeight = 10;

        // Label
        this.add.image(barX + 120, barY -5, 'title').setOrigin(0.5).setScale(0.7);
        this.add.bitmapText(barX + barWidth / 2, barY - 25, 'pixelFont', 'VOLUME', 24).setOrigin(0.5);

        //draw bar
        const volumeBar = this.add.graphics();
        volumeBar.fillStyle(0xffffff, 0.7);
        volumeBar.fillRect(barX, barY, barWidth, barHeight);

        //set first volume
        let volume = this.registry.get('soundVolume');
        if (typeof volume !== 'number') volume = 1;

        // Draw handle
        const handle = this.add.circle(barX + (volume / 2) * barWidth, barY + barHeight / 2, 12, 0xFF0000)
            .setInteractive({ useHandCursor: true, draggable: true });

        // Drag logic
        handle.on('drag', (pointer, dragX) => {
            // Clamp handle position
            let newX = Phaser.Math.Clamp(dragX, barX, barX + barWidth);
            handle.x = newX;
            // Calculate volume (0 to 2)
            volume = (newX - barX) / barWidth * 2;
            this.registry.set('soundVolume', volume);
            this.sound.volume = volume;
        });

        // Set initial position
        handle.x = barX + (volume/2) * barWidth;

        // Enable drag
        this.input.setDraggable(handle);

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