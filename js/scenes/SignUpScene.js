export default class SignUpScene extends Phaser.Scene {
    constructor() {
        super('SignUpScene');
    }
    
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setInteractive().setDepth(0);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1.2, 0.7);

        // how to play text
        this.add.bitmapText(645, 155, 'pixelFont', 'SIGN UP', 40).setOrigin(0.5);

        //description text
        this.add.bitmapText(640, 225, 'pixelFont', 'Create a new account.  Choose a unique username \nand password to get started!', 13).setOrigin(0.5, 0.5).setCenterAlign().setTint(0x852020);

        //username box
        const usernameBox = this.add.rectangle(640, 295, 400, 50, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x000000);
        const usernameText = this.add.bitmapText(450, 255, 'pixelFont', 'Username:', 18).setOrigin(0, 0.5).setTint(0x852020);
        const usernameInput = this.add.dom(640, 295).createFromHTML('<input type="text" id="username" name="username" style="width: 380px; height: 30px; font-size: 20px; padding: 5px;" placeholder="">');
        usernameInput.node.focus();

        //password box
        const passwordBox = this.add.rectangle(640, 380, 400, 50, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x000000);
        const passwordText = this.add.bitmapText(450, 340, 'pixelFont', 'Password:', 18).setOrigin(0, 0.5).setTint(0x852020);
        const passwordInput = this.add.dom(640, 380).createFromHTML('<input type="password" id="password" name="password" style="width: 380px; height: 30px; font-size: 20px; padding: 5px;" placeholder="">');
        passwordInput.node.focus();

        //password confirm box
        const passwordConfirmBox = this.add.rectangle(640, 465, 400, 50, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x000000);
        const passwordConfirmText = this.add.bitmapText(450, 425, 'pixelFont', 'Confirm Password:',18).setOrigin(0, 0.5).setTint(0x852020);
        const passwordConfirmInput = this.add.dom(640, 465).createFromHTML('<input type="password" id="passwordConfirm" name="passwordConfirm" style="width: 380px; height: 30px; font-size: 20px; padding: 5px;" placeholder="">');
        passwordConfirmInput.node.focus();

        //back to login text
        const loginText = this.add.bitmapText(640, 510, 'pixelFont', 'Already have an account?  Log in here.', 11).setOrigin(0.5).setTint(0x852020).setInteractive();

        loginText.on('pointerover', () => {
            loginText.setTint(0xc27070);
        });
        loginText.on('pointerout', () => {
            loginText.setTint(0x852020);
        });

        loginText.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            this.scene.stop();
            this.scene.launch('LoginScene');
        });

        //signup button
        const signupButton = this.add.rectangle(640, 580, 200, 50, 0x852020).setOrigin(0.5).setStrokeStyle(2, 0x000000).setInteractive();
        const signupButtonText = this.add.bitmapText(640, 580, 'pixelFont', 'SIGN UP', 24).setOrigin(0.5);

        signupButton.on('pointerover', () => {
            signupButton.setFillStyle(0xc27070);
        });
        signupButton.on('pointerout', () => {
            signupButton.setFillStyle(0x852020);
        });

        const errorText = this.add.bitmapText(640, 535, 'pixelFont', '', 12).setOrigin(0.5).setTint(0x852020);

        signupButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const passwordConfirm = document.getElementById('passwordConfirm').value.trim();

            if (!username || !password || !passwordConfirm) {
                errorText.setText('Please fill in all fields.');
                return;
            }

            if (password !== passwordConfirm) {
                errorText.setText('Passwords do not match. Please try again.');
                return;
            }

            // Check if user already exists
            let savedData = localStorage.getItem(username);
            let playerData;

            if (savedData) {
                // Existing user return
                errorText.setText('Username already taken. Please choose another.');
                return;
            } else {
                // New user, create save file, use guest data

                playerData = {
                    username: username,
                    password: password,
                    currency: this.registry.get("playerData").currency,
                    unlockedCars: this.registry.get("playerData").unlockedCars,
                    stats: this.registry.get("playerData").stats,
                    XP: this.registry.get("playerData").XP,
                    level: this.registry.get("playerData").level,
                    totalCurrencyEarned: this.registry.get("playerData").totalCurrencyEarned,
                    fastestTime: this.registry.get("playerData").fastestTime
                };
                localStorage.setItem(username, JSON.stringify(playerData));
                console.log("New account created!");
                

                //log in immediately
                this.registry.set("playerData", playerData);
                this.registry.set("activeUser", username);
                this.scene.start("MenuScene");

            }

        });

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
            if (this.scene.isPaused('SettingsScene')) {
                this.scene.resume('SettingsScene');
            }

            if (this.scene.isPaused('PauseScene')) {
                this.scene.resume('PauseScene');
            }

            this.scene.stop();
        });

    }

    
}