export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }
    create() {
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeCapture(['E', 'Q', 'SPACE']);
        }

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setInteractive().setDepth(0);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1.2, 0.7);

        // how to play text
        this.add.bitmapText(645, 155, 'pixelFont', 'LOGIN', 40).setOrigin(0.5);

        //description text
        this.add.bitmapText(640, 235, 'pixelFont', 'Login to save your progress and access \nexclusive features! Enter your username and \npassword below to get started.', 13).setOrigin(0.5, 0.5).setCenterAlign().setTint(0x852020);

        //username box
        const usernameBox = this.add.rectangle(640, 340, 400, 50, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x000000);
        const usernameText = this.add.bitmapText(450, 290, 'pixelFont', 'Username:', 20).setOrigin(0, 0.5).setTint(0x852020);
        const usernameInput = this.add.dom(640, 340).createFromHTML('<input type="text" id="username" name="username" style="width: 380px; height: 30px; font-size: 20px; padding: 5px;" placeholder="">');
        usernameInput.node.focus();

        //password box
        const passwordBox = this.add.rectangle(640, 440, 400, 50, 0xffffff).setOrigin(0.5).setStrokeStyle(2, 0x000000);
        const passwordText = this.add.bitmapText(450, 390, 'pixelFont', 'Password:', 20).setOrigin(0, 0.5).setTint(0x852020);
        const passwordInput = this.add.dom(640, 440).createFromHTML('<input type="password" id="password" name="password" style="width: 380px; height: 30px; font-size: 20px; padding: 5px;" placeholder="">');
        passwordInput.node.focus();

        //login button
        const loginButton = this.add.rectangle(530, 550, 200, 50, 0x852020).setOrigin(0.5).setStrokeStyle(2, 0x000000).setInteractive();
        const loginButtonText = this.add.bitmapText(530, 550, 'pixelFont', 'LOGIN', 24).setOrigin(0.5);

        loginButton.on('pointerover', () => {
            loginButton.setFillStyle(0xc27070);
        });
        loginButton.on('pointerout', () => {
            loginButton.setFillStyle(0x852020);
        });

        const errorText = this.add.bitmapText(640, 480, 'pixelFont', '', 12).setOrigin(0.5).setTint(0x852020);

        loginButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                errorText.setText('Please enter both username and password.');
                return;
            }

            let savedData = localStorage.getItem(username);

            if (savedData) {
                // User exists
                let playerData = JSON.parse(savedData);

                if (playerData.password === password) {
                    // Success - store active user in registry
                    this.registry.set("playerData", playerData);
                    const upgrades = {};
                    for (const carKey in playerData.unlockedCars) {
                        if (playerData.unlockedCars.hasOwnProperty(carKey)) {
                            upgrades[carKey] = playerData.unlockedCars[carKey];
                        }
                    }
                    this.registry.set('upgrades', upgrades);
                    //reset choices
                    this.registry.set('selectedCarData', {
                        body: 'ferrari_white',
                        wheels: 'wheels',
                        type: 'ferrari',
                        stage: upgrades['ferrari']
                    });
                    this.scene.stop();
                    this.scene.start("MenuScene");
                    this.scene.launch('ProfileScene');
                } else {
                    errorText.setText('Incorrect password. Please try again.');
                }
            } else {
                errorText.setText('Username not found. Please sign up.');
            }
        });

        //signup button
        const signUpButton = this.add.rectangle(750, 550, 200, 50, 0x852020).setOrigin(0.5).setStrokeStyle(2, 0x000000).setInteractive();
        const signUpButtonText = this.add.bitmapText(750, 550, 'pixelFont', 'SIGN UP', 24).setOrigin(0.5);

        signUpButton.on('pointerover', () => {
            signUpButton.setFillStyle(0xc27070);
        });
        signUpButton.on('pointerout', () => {
            signUpButton.setFillStyle(0x852020);
        });

        signUpButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            this.scene.stop();
            this.scene.launch('SignUpScene');
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