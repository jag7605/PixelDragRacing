export default class PerfectStart {
    constructor(scene, playerCar, cursors) {
        this.scene = scene;
        this.playerCar = playerCar;
        this.cursors = cursors;
        this.countdownActive = false; // Is countdown ongoing
        this.falseStart = false; // Did player false start
        this.perfectStart = false; // Did player achieve perfect start
        this.attemptMade = false; // Track if player already tried
        this.wasKeyDownAtGo = false; // Track if key was held when GO appeared
        this.goTime = null; // Timestamp when "GO!" appeared
        this.perfectWindow = 200; // ms after "GO" for perfect start
        this.boostAmount = 25; // Speed boost for perfect start
        this.notification = null; // Current notification text object
        this.notificationBg = null; // Background for notification
    }

    startCountdown() { // Call when countdown begins
        this.countdownActive = true;
        this.falseStart = false;
        this.perfectStart = false;
        this.attemptMade = false;
        this.wasKeyDownAtGo = false;
        this.goTime = null;
        console.log('PerfectStart: Countdown started'); // Debug log
    }

    setGoTime(time) { // Call when "GO!" appears
        this.goTime = time;
        this.countdownActive = false;
        // Check if key is already held down when GO appears
        this.wasKeyDownAtGo = this.cursors.up.isDown; // Check key state
        if (this.wasKeyDownAtGo) { // False start if key held
            this.falseStart = true;
            this.attemptMade = true;
            this.showNotification('SLOW LAUNCH!', 0xff0000);
            console.log('PerfectStart: False start - key was held at GO');
        }
        console.log('PerfectStart: GO time set', time, 'Key was down:', this.wasKeyDownAtGo);
    }

    update() {
        if (!this.cursors || !this.cursors.up) {
            console.log('PerfectStart: No cursors available');
            return;
        }

        // During countdown - check for false start
        if (this.countdownActive) {
            if (this.cursors.up.isDown) {
                this.falseStart = true;
                this.attemptMade = true;
                this.showNotification('SLOW LAUNCH', 0xff0000);
                console.log('PerfectStart: False start detected');
            }
        } 
        // After "GO!" - check for perfect start (only if no attempt made yet)
        else if (this.goTime && !this.attemptMade) {
            // Check if player just pressed the key (not holding from before)
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.attemptMade = true;
                const pressTime = this.scene.time.now - this.goTime;
                console.log('PerfectStart: Up pressed, pressTime=', pressTime);
                
                if (pressTime <= this.perfectWindow) {
                    // Perfect start!
                    this.perfectStart = true;
                    this.playerCar.speed += this.boostAmount;
                    this.showNotification('PERFECT START!', 0x00ff00);
                    if (!this.scene.registry.get('sfxMuted')) {
                        this.scene.sound.play('buttonSound');
                    }
                    console.log('PerfectStart: Perfect start applied, speed=', this.playerCar.speed);
                } else {
                    // Missed the window
                    this.showNotification('SLOW LAUNCH!', 0xffaa00);
                    console.log('PerfectStart: Missed perfect start window');
                }
            }
        }
    }

    showNotification(text, tint) { // Display notification on screen
        if (this.notification) this.notification.destroy();
        if (this.notificationBg) this.notificationBg.destroy();

        // Create semi-transparent background box
        const padding = 20;
        const tempText = this.scene.add.bitmapText(0, 0, 'pixelFont', text, 40);
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        tempText.destroy();

        this.notificationBg = this.scene.add.graphics() // Background box
            .setScrollFactor(0)
            .setDepth(19)
            .setAlpha(0);

        this.notificationBg.fillStyle(0x000000, 0.7); // Background style
        this.notificationBg.fillRoundedRect(
            640 - (textWidth / 2) - padding,
            200 - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2),
            10
        );

        // Add border/outline to background
        this.notificationBg.lineStyle(3, tint, 0.8);
        this.notificationBg.strokeRoundedRect(
            640 - (textWidth / 2) - padding,
            200 - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2),
            10
        );

        // Create text with shadow effect for outline
        this.notification = this.scene.add.bitmapText(640, 200, 'pixelFont', text, 40)
            .setOrigin(0.5)
            .setDepth(20)
            .setTint(tint)
            .setAlpha(0)
            .setScrollFactor(0);

        // Tween both background and text together
        this.scene.tweens.add({
            targets: [this.notification, this.notificationBg],
            alpha: 1,
            duration: 300,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: [this.notification, this.notificationBg],
                    alpha: 0,
                    duration: 1000,
                    delay: 2000,
                    onComplete: () => {
                        if (this.notification) this.notification.destroy();
                        if (this.notificationBg) this.notificationBg.destroy();
                        this.notification = null;
                        this.notificationBg = null;
                    }
                });
            }
        });
    }

    reset() { // Reset all states
        this.countdownActive = false;
        this.falseStart = false;
        this.perfectStart = false;
        this.attemptMade = false;
        this.wasKeyDownAtGo = false;
        this.goTime = null;
        if (this.notification) this.notification.destroy();
        if (this.notificationBg) this.notificationBg.destroy();
        this.notification = null;
        this.notificationBg = null;
        console.log('PerfectStart: Reset');
    }
}