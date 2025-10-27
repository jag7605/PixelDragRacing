export default class ModeSelection {
    static showModeSelection(scene, onModeSelected) {
        const overlay = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);
        const box = scene.add.rectangle(640, 360, 450, 250, 0xffffff, 0.9).setStrokeStyle(4, 0x000000);

        const title = scene.add.bitmapText(640, 280, 'pixelFont', 'SELECT MODE', 30)
            .setTint(0x990000)
            .setOrigin(0.5);

        const dayBtn = scene.add.image(550, 360, 'dayIcon').setInteractive().setScale(0.4);
        const nightBtn = scene.add.image(730, 360, 'nightIcon').setInteractive().setScale(0.5);

        const dayLabel = scene.add.bitmapText(550, 420, 'pixelFont', 'DAY', 18).setTint(0xFFA500).setOrigin(0.5);
        const nightLabel = scene.add.bitmapText(730, 420, 'pixelFont', 'NIGHT', 18).setTint(0x000066).setOrigin(0.5);

        dayBtn.on('pointerover', () => dayBtn.setTint(0xFFD580));
        dayBtn.on('pointerout', () => dayBtn.clearTint());
        nightBtn.on('pointerover', () => nightBtn.setTint(0xFF5555));
        nightBtn.on('pointerout', () => nightBtn.clearTint());

        const cleanup = () => {
            overlay.destroy();
            box.destroy();
            dayBtn.destroy();
            nightBtn.destroy();
            title.destroy();
            dayLabel.destroy();
            nightLabel.destroy();
        };

        dayBtn.on('pointerdown', () => {
            cleanup();
            onModeSelected('day');
        });

        nightBtn.on('pointerdown', () => {
            cleanup();
            onModeSelected('night');
        });
    }

    static showDifficultySelection(scene, onDifficultySelected) {
        const overlay = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);
        const box = scene.add.rectangle(640, 360, 450, 250, 0xffffff, 0.9).setStrokeStyle(4, 0x000000);

        const title = scene.add.bitmapText(640, 280, 'pixelFont', 'SELECT DIFFICULTY', 25)
            .setTint(0x3333aa)
            .setOrigin(0.5);

        const easyBtn = scene.add.bitmapText(540, 350, 'pixelFont', 'EASY', 25)
            .setTint(0x00ff00)
            .setOrigin(0.5)
            .setInteractive();
        const normalBtn = scene.add.bitmapText(640, 400, 'pixelFont', 'NORMAL', 25)
            .setTint(0xffff00)
            .setOrigin(0.5)
            .setInteractive();
        const hardBtn = scene.add.bitmapText(740, 450, 'pixelFont', 'HARD', 25)
            .setTint(0xff0000)
            .setOrigin(0.5)
            .setInteractive();

        const cleanup = () => {
            overlay.destroy();
            box.destroy();
            title.destroy();
            easyBtn.destroy();
            normalBtn.destroy();
            hardBtn.destroy();
        };

        easyBtn.on('pointerdown', () => {
            cleanup();
            onDifficultySelected(0.4); // bot skill
        });
        normalBtn.on('pointerdown', () => {
            cleanup();
            onDifficultySelected(0.7);
        });
        hardBtn.on('pointerdown', () => {
            cleanup();
            onDifficultySelected(0.95);
        });
    }

    static showTrackLengthSelection(scene, onLengthSelected) {
        const overlay = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);
        const box = scene.add.rectangle(640, 360, 450, 250, 0xffffff, 0.9).setStrokeStyle(4, 0x000000);

        const title = scene.add.bitmapText(640, 280, 'pixelFont', 'SELECT TRACK LENGTH', 23)
            .setTint(0x3333aa)
            .setOrigin(0.5);

        const shortBtn = scene.add.bitmapText(540, 350, 'pixelFont', 'SHORT', 25)
            .setTint(0x00ff00).setOrigin(0.5).setInteractive();
        const mediumBtn = scene.add.bitmapText(640, 400, 'pixelFont', 'MEDIUM', 25)
            .setTint(0xffff00).setOrigin(0.5).setInteractive();
        const longBtn = scene.add.bitmapText(740, 450, 'pixelFont', 'LONG', 25)
            .setTint(0xff0000).setOrigin(0.5).setInteractive();

        const cleanup = () => {
            overlay.destroy();
            box.destroy();
            title.destroy();
            shortBtn.destroy();
            mediumBtn.destroy();
            longBtn.destroy();
        };

        shortBtn.on('pointerdown', () => { cleanup(); onLengthSelected(2500); });
        mediumBtn.on('pointerdown', () => { cleanup(); onLengthSelected(3000); });
        longBtn.on('pointerdown', () => { cleanup(); onLengthSelected(4000); });
    }
}
