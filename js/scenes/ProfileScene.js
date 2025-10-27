export default class ProfileScene extends Phaser.Scene {
    constructor() {
        super('ProfileScene');
    }
    create() {
        let playerData = this.registry.get("playerData");

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setInteractive().setDepth(0);

        // Yellow square in the center
        this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //title image
        this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1.2, 0.7);

        // how to play text
        this.add.bitmapText(645, 155, 'pixelFont', 'PROFILE', 40).setOrigin(0.5);

        //description text
        this.add.bitmapText(640, 235, 'pixelFont', `Hello, ${playerData.username}`, 35).setOrigin(0.5, 0.5).setCenterAlign().setTint(0x852020);

        // display money
        this.add.bitmapText(640, 280, 'pixelFont', `Current Prize: $${playerData.currency.toString()}`, 18)
            .setOrigin(0.5)
            .setTint(0x852020);

        //display cars
        this.unlockedCars = playerData.unlockedCars;
        // Count and title
        this.add.bitmapText(640, 300, 'pixelFont',
            `Cars Unlocked: ${Object.keys(this.unlockedCars || {}).length}`,
            18
        )
            .setOrigin(0.5)
            .setTint(0x852020);

        // display car icons in a grid (3 per row)
        const carNames = Object.keys(this.unlockedCars || {});
        const startX = 340; 
        const startY = 360; 
        const spacingX = 200; 
        const spacingY = 120; 
        const carsPerRow = 4;
        const totalRows = Math.ceil(carNames.length / carsPerRow);

        carNames.forEach((carKey, index) => {
            const col = index % carsPerRow;
            const row = Math.floor(index / carsPerRow);

            // how many cars in this row
            const carsInThisRow = (row === totalRows - 1 && carNames.length % carsPerRow !== 0)
                ? carNames.length % carsPerRow
                : carsPerRow;

            // total width occupied by cars in this row
            const rowWidth = (carsInThisRow - 1) * spacingX;

            // dynamic X so the row is centered
            const startX = 640 - rowWidth / 2;

            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            // car image 
            const carImage = this.add.image(x, y, carKey +"_white")
                .setOrigin(0.5)
                .setScale(1);
            
            //if troll car make smaller
            if(carKey == 'trollcar'){
                carImage.setScale(0.5);
                carImage.setPosition(x, y-25);
            }

            // car name
            this.add.bitmapText(x, y + 50, 'pixelFont', carKey.toUpperCase(), 14)
                .setOrigin(0.5)
                .setTint(0x852020);
        });
        
        //log out button
        const logoutButton = this.add.rectangle(640, 590, 200, 50, 0x852020).setOrigin(0.5).setStrokeStyle(2, 0x000000).setInteractive();
        const logoutButtonText = this.add.bitmapText(640, 590, 'pixelFont', 'LOG OUT', 24).setOrigin(0.5);

        logoutButton.on('pointerover', () => {
            logoutButton.setFillStyle(0xc27070);
        });
        logoutButton.on('pointerout', () => {
            logoutButton.setFillStyle(0x852020);
        });

        const errorText = this.add.bitmapText(640, 480, 'pixelFont', '', 12).setOrigin(0.5).setTint(0x852020);

        logoutButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            playerData = {
                username: "Guest",
                currency: 0,      // starting money for this session
                unlockedCars: { ferrari: 1 }, // default cars
                stats: { races: 0, wins: 0, losses: 0, totalShifts: 0, shifts: 0 },
                XP: 0,
                level: 1,
                totalCurrencyEarned: 0,
                fastestTime: 0
            };
            this.registry.set("playerData", playerData);
            const upgrades = {};
            for (const carKey in playerData.unlockedCars) {
                if (playerData.unlockedCars.hasOwnProperty(carKey)) {
                    upgrades[carKey] = playerData.unlockedCars[carKey];
                }
            }

            this.registry.set('selectedCarData', {
                body: 'ferrari_white',
                wheels: 'wheels',
                type: 'ferrari',
                stage: 1
            });

            this.registry.set('upgrades', upgrades);
            this.scene.stop();
            this.scene.start('MenuScene');
            this.scene.launch('LoginScene');
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