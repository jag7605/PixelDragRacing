export default class NitrousMiniGame {
    constructor(scene, onComplete) {
        this.scene = scene;
        this.onComplete = onComplete;
        this.isActive = false;
        this.marker = null;
        this.greenZoneRect = null;
        this.bar = null;
        this.overlay = null;
        this.nitrousKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.instructionText = null;
        this.notificationText = null;
        this.notificationBg = null;
        this.countdownText = null;
        this.start();
    }

    start() {
        this.isActive = true;
        this.scene.isPaused = true;

        const { width: W, height: H } = this.scene.scale;

        // Dim backdrop overlay (fixed to screen)
        this.overlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5)
            .setDepth(10)
            .setInteractive()
            .setScrollFactor(0);

        // Horizontal bar (gauge) (fixed to screen)
        this.bar = this.scene.add.rectangle(W / 2, H / 2, 400, 20, 0x333333)
            .setDepth(11)
            .setScrollFactor(0);

        // Green zone (fixed to screen)
        this.greenZone = { x: W / 2 - 40, width: 80 };
        this.greenZoneRect = this.scene.add.rectangle(this.greenZone.x + this.greenZone.width / 2, H / 2, this.greenZone.width, 20, 0x00ff00)
            .setDepth(11)
            .setScrollFactor(0);

        // Sliding marker (fixed to screen)
        this.marker = this.scene.add.rectangle(W / 2 - 200, H / 2, 10, 20, 0xffffff)
            .setDepth(11)
            .setScrollFactor(0);

        // Animate marker back-and-forth
        this.scene.tweens.add({
            targets: this.marker,
            x: W / 2 + 200,
            duration: 750,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
        });

        // Instructional text with custom bitmap font (fixed to screen)
        this.instructionText = this.scene.add.bitmapText(W / 2, H / 2 + 75, 'pixelFont', 'PRESS SPACE ON GREEN ZONE TO ACTIVATE NITROUS', 24)
            .setOrigin(0.5)
            .setDepth(11)
            .setScrollFactor(0);

        // Countdown text with custom bitmap font (fixed to screen)
        this.countdownText = this.scene.add.bitmapText(W / 2, H / 2 - 75, 'pixelFont', '5', 32)
            .setOrigin(0.5)
            .setDepth(11)
            .setScrollFactor(0)
            .setTint(0xffffff);

        // Countdown timer (5 seconds)
        let timeLeft = 5;
        this.scene.time.addEvent({
            delay: 1000,
            repeat: 4,
            callback: () => {
                timeLeft--;
                if (this.countdownText && this.isActive) {
                    this.countdownText.setText(timeLeft.toString());
                    if (timeLeft === 0) this.countdownText.setText('0');
                }
            },
            callbackScope: this
        });

        // Listen for press
        this.nitrousKey.on('down', this.handlePress, this);

        // Auto-resume timer (5 seconds)
        this.timeout = this.scene.time.delayedCall(5000, () => {
            if (this.isActive) this.end(false);
        }, [], this);
    }

    handlePress() {
        if (!this.isActive) return;

        const isSuccess = this.marker.x >= this.greenZone.x && this.marker.x <= this.greenZone.x + this.greenZone.width;
        this.end(isSuccess);
    }

    end(isSuccess) {
        this.isActive = false;
        this.nitrousKey.off('down', this.handlePress, this);
        if (this.timeout) this.timeout.remove();
        if (this.overlay) this.overlay.destroy();
        if (this.marker) this.marker.destroy();
        if (this.greenZoneRect) this.greenZoneRect.destroy();
        if (this.bar) this.bar.destroy();
        if (this.instructionText) this.instructionText.destroy();
        if (this.countdownText) this.countdownText.destroy();
        if (this.notificationText) this.notificationText?.destroy();
        if (this.notificationBg) this.notificationBg?.destroy();

        // Styled notification with background
        const message = isSuccess ? 'NITROUS ACTIVATED!' : 'NITROUS ACTIVATION FAILED!';
        const tint = isSuccess ? 0x00ff00 : 0xff0000;
        const notificationX = 640; // Center of screen
        const notificationY = 200; // Top-center area
        
        // Create semi-transparent background box
        const padding = 20;
        const tempText = this.scene.add.bitmapText(0, 0, 'pixelFont', message, 32);
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        tempText.destroy();

        this.notificationBg = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(11)
            .setAlpha(0);

        this.notificationBg.fillStyle(0x000000, 0.7);
        this.notificationBg.fillRoundedRect(
            notificationX - (textWidth / 2) - padding,
            notificationY - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2),
            10
        );

        // Add border/outline to background
        this.notificationBg.lineStyle(3, tint, 0.8);
        this.notificationBg.strokeRoundedRect(
            notificationX - (textWidth / 2) - padding,
            notificationY - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2),
            10
        );

        // Create notification text
        this.notificationText = this.scene.add.bitmapText(notificationX, notificationY, 'pixelFont', message, 32)
            .setOrigin(0.5)
            .setDepth(12)
            .setScrollFactor(0)
            .setTint(tint)
            .setAlpha(0);

        // Tween both background and text together
        this.scene.tweens.add({
            targets: [this.notificationText, this.notificationBg],
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: [this.notificationText, this.notificationBg],
                    alpha: 0,
                    duration: 1000,
                    delay: 1500,
                    onComplete: () => {
                        if (this.notificationText) this.notificationText.destroy();
                        if (this.notificationBg) this.notificationBg.destroy();
                    }
                });
            }
        });

        this.scene.isPaused = false;
        this.onComplete(isSuccess);
    }
}