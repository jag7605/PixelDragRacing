import { savePlayerDataFromScene } from '../utils/playerData.js';
import NitrousTuner from '../gameplay/NitrousTuner.js';
import ModeSelection from '../ui/ModeSelection.js';

import RaceScene from './RaceScene.js';

// SAFE SCENE RESTART HELPER
function safeStartScene(currentScene, sceneKey, SceneClass) {
    const sm = currentScene.scene;
    const existing = sm.get(sceneKey);
    if (existing && existing.sys?.settings?.status === Phaser.Scene.SHUTDOWN) {
        sm.remove(sceneKey);
    }
    if (!sm.get(sceneKey)) {
        sm.add(sceneKey, SceneClass, false);
    }
    sm.start(sceneKey);
}

export default class GarageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GarageScene' });
    }

    create() {
        this.selectedCarKey = this.registry.get('selectedCar');
        let playerData = this.registry.get("playerData");

        // Background and title
        this.add.image(640, 360, 'garage_bg');
        this.add.image(640, 100, 'title').setOrigin(0.5).setScale(0.9);
        this.add.bitmapText(645, 105, 'pixelFont', 'GARAGE', 40).setOrigin(0.5);

        // Car definitions
        this.cars = this.registry.get('cars');

        this.wheels = this.registry.get('wheels');

        this.largeCar = null;
        this.selectButton = null;
        this.startButton = null;
        this.checkMark = null;
        this.checkMarkBox = null;
        this.selectBG = null;
        this.bodyChoice = this.registry.get('selectedBody');
        this.wheelChoice = this.registry.get('selectedWheels');
        this.CarChoice = this.registry.get('selectedCar');
        this.wheelScale = 1
        this.wheelX = 0;
        this.wheelY = 0;

        //display money

        this.add.image(30, 30, 'moneyIcon').setScale(0.03);
        this.moneyText = this.add.bitmapText(70, 20, 'pixelFont', `$${playerData.currency}`, 20).setOrigin(0, 0);

        //display level
        this.levelText = this.add.bitmapText(90, 70, 'pixelFont', `Level: ${playerData.level}`, 20).setOrigin(0.5);

        // Scroll container
        this.carContainer = this.add.container(640, 550); // centered at bottom
        //set mask for start button
        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.fillRect(100, 0, 880, 720); // x, y, width, height
        const mask = shape.createGeometryMask();
        this.carContainer.setMask(mask);

        this.carOffsetX = 0;

        const spacing = 300; // distance between cars
        this.unlockedCars = this.registry.get("playerData").unlockedCars;

        this.cars.forEach((car, index) => {
            const x = index * spacing;
            const unlockedStage = playerData.unlockedCars[car.key] || 0; // 0 = locked
            const unlocked = unlockedStage > 0;
            this.wheelScale = car.wheelScale;
            this.wheelX = car.wheelX;
            this.wheelY = car.wheelY;
            car.selectedBody = car.selectedBody || car.bodies[0].key;
            car.selectedWheels = car.selectedWheels || 'wheels';


            // Box & colour overlay
            const box = this.add.image(x, 90, 'box').setOrigin(0.5).setScale(1.2, 0.5);
            box.setInteractive();
            car.boxX = x;
            car.boxY = 90;
            car.colourBox = this.add.rectangle(x, 90, 307.2, 128, 0x286935)
                .setOrigin(0.5)
                .setAlpha(0.7)
                .setVisible(car.key === this.registry.get('selectedCar'));

            // Locked overlay
            if (!unlocked) {
                let lockedText = playerData.level < car.level
                    ? `LOCKED\nLEVEL ${car.level}\nREQUIRED`
                    : `LOCKED\n$${car.cost}`;
                car.costText = this.add.bitmapText(x, 90, 'pixelFont', lockedText, 20)
                    .setOrigin(0.5)
                    .setTint(0xff0000);
                car.LockedBox = this.add.rectangle(x, 90, 307.2, 128, 0x555555)
                    .setOrigin(0.5)
                    .setAlpha(0.7);
            }

            // Car body + wheels
            const displayKey = car.bodies ? car.bodies[0].key : car.key;

            // Combine into container at correct position
            let sprites = [this.add.sprite(0, 0, displayKey).setScale(car.scale)];
            if (car.hasWheels !== false) {
                sprites.push(this.add.sprite(0, 0, 'wheels').setScale(car.scale * car.wheelScale, car.scale));
            }

            const carContainer = this.add.container(
                x + (car.wheelX || 0),
                car.y + (car.wheelY || 0),
                sprites);

            carContainer.setSize(200, 120); // approximate hit area
            carContainer.setInteractive(
                new Phaser.Geom.Rectangle(-100, -60, 200, 120),
                Phaser.Geom.Rectangle.Contains
            );

            box.on('pointerdown', () => {
                if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
                this.showLargeCar(car);
                this.showStart(car);
            });

            // Store references for updates
            car.container = carContainer;

            // Add everything to scroll container
            this.carContainer.add([car.colourBox, carContainer, box]);
            if (car.LockedBox) this.carContainer.add(car.LockedBox);
            if (car.costText) this.carContainer.add(car.costText);
        });


        // Scrolling arrows
        const leftArrow = this.add.image(50, 620, 'arrow').setInteractive().setScale(0.04).setFlipX(true);
        const rightArrow = this.add.image(1030, 620, 'arrow').setInteractive().setScale(0.04);

        leftArrow.on('pointerdown', () => {
            this.carOffsetX += 200;
            this.carContainer.x = Phaser.Math.Clamp(this.carOffsetX + 640, -500, 640);
        });

        rightArrow.on('pointerdown', () => {
            this.carOffsetX -= 200;
            this.carContainer.x = Phaser.Math.Clamp(this.carOffsetX + 640, -((this.cars.length - 2) * spacing), 640);
        });

        // Show initial selected car
        let selectedData = this.registry.get('selectedCarData') || {};
        let selectedCar = this.cars.find(c => c.key === selectedData.type) || this.cars[0];
        if (selectedCar) {
            this.CarChoice = selectedCar.key;
            this.bodyChoice = selectedData.body || selectedCar.bodies[0].key;
            this.wheelChoice = selectedData.wheels || 'wheels';
            selectedCar.selectedBody = this.bodyChoice;
            selectedCar.selectedWheels = this.wheelChoice;
            this.showLargeCar(selectedCar);
            this.showStart(selectedCar);
        }



        // Menu button
        const menuButton = this.add.image(1230, 50, 'menu').setInteractive().setScale(0.4);
        menuButton.on('pointerover', () => menuButton.setTint(0x888888));
        menuButton.on('pointerout', () => menuButton.clearTint());
        menuButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
            this.scene.start('MenuScene');
        });

        // Nitrous tuning button
        this.tuneButton = this.add.image(185, 550, 'btn_resume')
            .setInteractive()
            .setScale(0.3)
            .setDepth(10)
            .on('pointerover', () => this.tuneButton.setTint(0xdddd00))
            .on('pointerout', () => this.tuneButton.clearTint())
            .on('pointerdown', () => {
                if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
                if (!this.tuningOverlay) {
                    this.tuningOverlay = new NitrousTuner(this);
                }
            });
        this.add.bitmapText(185, 550, 'pixelFont', 'Tune Nitrous', 12)
            .setOrigin(0.5)
            .setTint(0xffffff)
            .setDepth(11);
        this.tuningOverlay = null;

    }

    showLargeCar(car) {
        let playerData = this.registry.get("playerData");
        const unlockedStage = playerData.unlockedCars[car.key] || 0; // 0 = locked
        let wheel = this.wheelChoice;

        // Destroy previous large car and UI
        if (this.largeCar) this.largeCar.destroy();
        if (this.largeCarWheels) this.largeCarWheels.destroy();
        if (this.selectButton) this.selectButton.destroy();
        if (this.selectBG) this.selectBG.destroy();
        if (this.checkMarkBox) this.checkMarkBox.destroy();
        if (this.bodyOptions) this.bodyOptions.forEach(opt => opt.destroy());
        if (this.wheelOptions) this.wheelOptions.forEach(opt => opt.destroy());
        if (this.stageInfoText) this.stageInfoText.destroy();
        if (this.upgradeBtn) this.upgradeBtn.destroy();
        if (this.upgradeLabel) this.upgradeLabel.destroy();

        // Grey info box behind stage info
        this.infoBox = this.add.image(190, 350, 'greySquare').setScale(0.4, 0.6);
        this.checkMarkBox = this.add.image(1220, 500, 'box').setScale(0.2);

        // Large car
        const bodyKey = car.selectedBody || (car.bodies && car.bodies.length > 0 ? car.bodies[0].key : car.key);
        const fixedBottomY = 550;
        this.largeCar = this.add.sprite(640, fixedBottomY, bodyKey).setScale(car.scale + 0.8).setOrigin(0.5, 1);

        // Large wheels
        if (car.hasWheels !== false) {
            this.largeCarWheels = this.add.sprite(640 + (car.wheelX || 0), fixedBottomY - 80 + (car.wheelY || 0), this.wheelChoice)
                .setScale(((car.scale + 0.8) * (car.wheelScale || 1)), car.scale + 0.8);
        }
        else {
            this.largeCarWheels = this.add.rectangle(640, fixedBottomY - 40, 200, 80, 0x00ff00, 0.2);
            this.largeCarWheels.setVisible(false);
        }

        this.largeCarContainer = this.add.container(0, 0, [this.largeCar, this.largeCarWheels]);

        // Select/Buy button
        let buttonX = 1010, buttonY = 500;
        let buttonScale = 0.6
        let buttonText = "SELECT", size = 32;

        if (!unlockedStage) {
            buttonText = `BUY - $${car.cost}`;
            size = 22;
            if (playerData.level < car.level) {
                buttonText = `LEVEL ${car.level} REQUIRED`;
                size = 22;
                buttonX = 990;
                buttonScale = 0.72;

            }
        }

        this.selectBG = this.add.image(buttonX, buttonY, 'select').setOrigin(0.5).setScale(buttonScale, 0.5);
        this.selectButton = this.add.bitmapText(buttonX, buttonY, 'pixelFont', buttonText, size)
            .setOrigin(0.5)
            .setInteractive();

        this.selectButton.on('pointerover', () => this.selectButton.setTint(0x800b0b));
        this.selectButton.on('pointerout', () => this.selectButton.setTint(0xffffff));

        this.selectButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            if (!unlockedStage) {
                // Attempt to buy
                if (playerData.currency >= car.cost && playerData.level >= car.level) {
                    playerData.currency -= car.cost;
                    playerData.unlockedCars[car.key] = 1;
                    this.moneyText.setText(`$${playerData.currency}`);
                    if (car.costText) car.costText.destroy();
                    if (car.LockedBox) car.LockedBox.destroy();
                    this.CarChoice = car.key;
                    this.bodyChoice = this.bodyChoice || car.bodies[0].key;
                    if (!car.bodies.some(body => body.key === this.bodyChoice)) {
                        this.bodyChoice = car.bodies[0].key; // fallback to first body
                    }
                    this.registry.set('selectedCarData', {
                        body: this.bodyChoice,
                        wheels: this.wheelChoice || 'wheels',
                        type: this.CarChoice,
                        stage: playerData.unlockedCars[this.CarChoice] || 1
                    });
                    this.showStart(car);
                    car.colourBox.setVisible(true);
                    this.selectButton.setText("SELECT");
                    this.selectButton.setFontSize(32);
                    this.registry.set("playerData", playerData);
                    savePlayerDataFromScene(this);
                    this.showLargeCar(car);
                    return;
                } else if (playerData.level < car.level) {
                    this.selectButton.setText(`LEVEL ${car.level} REQUIRED`);
                    this.selectButton.setFontSize(22);
                    return;

                } else if (playerData.currency < car.cost) {
                    this.selectButton.setText("NOT ENOUGH $");
                    this.selectButton.setFontSize(22);
                    return;
                }
                else {

                }
            }

            // Select car

            this.CarChoice = car.key;
            this.bodyChoice = this.bodyChoice || car.bodies[0].key;
            if (!car.bodies.some(body => body.key === this.bodyChoice)) {
                car.selectedBody = car.bodies[0].key; // fallback to first body
            }
            this.bodyChoice = car.selectedBody || car.bodies[0].key;
            this.wheelChoice = car.selectedWheels;
            this.registry.set('wheelScale', (car.wheelScale - 0.2));
            this.registry.set('selectedCarData', {
                body: this.bodyChoice,
                wheels: this.wheelChoice || 'wheels',
                type: this.CarChoice,
                stage: playerData.unlockedCars[this.CarChoice] || 1
            });
            this.showStart(car);
        });

        // Stage info text
        const currentStage = playerData.unlockedCars[car.key] || 7;
        this.stageInfoText = this.add.bitmapText(50, 230, 'pixelFont',
            `CAR: \n${car.key.toUpperCase()}\nSTAGE: ${currentStage}/${car.maxStage} \n0 - 100 Time: \n${[0, 7, 4, 2.5][currentStage] || 7} Seconds`, 20)
            .setOrigin(0, 0)
            .setTint(0xffffff)
            .setLineSpacing(30);

        // Upgrade button if unlocked and not max stage
        if (unlockedStage && currentStage < car.maxStage) {
            const upgradeCost = currentStage * 150 + 150;
            this.upgradeBtn = this.add.image(50, 450, 'btn_resume').setScale(0.5).setInteractive().setOrigin(0, 0.5);
            this.upgradeLabel = this.add.bitmapText(60, 450, 'pixelFont', `UPGRADE ($${upgradeCost})`, 17.5).setOrigin(0, 0.5);

            this.upgradeBtn.on('pointerover', () => this.upgradeBtn.setTint(0xdddd00));
            this.upgradeBtn.on('pointerout', () => this.upgradeBtn.clearTint());
            this.upgradeBtn.on('pointerdown', () => {
                if (playerData.currency < upgradeCost) {
                    this.upgradeLabel.setText("NOT ENOUGH $").setTint(0xff0000);
                    return;
                }

                // Confirm upgrade
                const confirmBox = this.add.rectangle(640, 360, 700, 200, 0x000000, 0.8);
                const confirmText = this.add.bitmapText(640, 320, 'pixelFont',
                    `Upgrade ${car.key.toUpperCase()} to Stage ${currentStage + 1}?`, 24).setOrigin(0.5);
                const yesBtn = this.add.bitmapText(590, 380, 'pixelFont', 'YES', 22).setOrigin(0.5).setTint(0x00e676).setInteractive();
                const noBtn = this.add.bitmapText(690, 380, 'pixelFont', 'NO', 22).setOrigin(0.5).setTint(0xff5a5a).setInteractive();

                yesBtn.on('pointerdown', () => {
                    playerData.currency -= upgradeCost;
                    playerData.unlockedCars[car.key] = currentStage + 1;
                    this.registry.set('playerData', playerData);
                    //update upgrades
                    const upgrades = {};
                    for (const carKey in playerData.unlockedCars) {
                        if (playerData.unlockedCars.hasOwnProperty(carKey)) {
                            upgrades[carKey] = playerData.unlockedCars[carKey];
                        }
                    }
                    this.registry.set('upgrades', upgrades);

                    savePlayerDataFromScene(this);
                    confirmBox.destroy(); confirmText.destroy(); yesBtn.destroy(); noBtn.destroy();
                    this.moneyText.setText(`$${playerData.currency}`);
                    this.showLargeCar(car);
                });

                noBtn.on('pointerdown', () => {
                    confirmBox.destroy(); confirmText.destroy(); yesBtn.destroy(); noBtn.destroy();
                });
            });
        } else if (unlockedStage && currentStage >= car.maxStage) {
            this.add.image(50, 450, 'btn_resume').setScale(0.5).setInteractive().setOrigin(0, 0.5);
            this.add.bitmapText(60, 450, 'pixelFont', `MAX LEVEL`, 17.5).setOrigin(-0.25, 0.5);
        }

        // Body selection thumbnails

        this.add.image(1010, 320, 'greySquare').setScale(0.4);

        //titles 
        this.add.bitmapText(1010, 230, 'pixelFont', `CAR BODY`, 17.5).setOrigin(0.5);
        this.add.bitmapText(1010, 320, 'pixelFont', `CAR WHEELS`, 17.5).setOrigin(0.5);

        const spacing = 100;
        this.bodyOptions = [];
        const numBodies = car.bodies.length;
        const centerX = 1010;
        const startX = centerX - ((numBodies - 1) * spacing) / 2;
        let add = 0;
        if (car.key === 'trollcar') {
            add = -30;
        }

        car.bodies.forEach((body, i) => {
            const x = startX + i * spacing;
            const thumb = this.add.image(x, 280 + add, body.key)
                .setScale(0.5)
                .setInteractive()
                .setAlpha(body.key === bodyKey ? 1 : 0.5);

            thumb.on('pointerover', () => thumb.setAlpha(1));
            thumb.on('pointerout', () => { if (body.key !== this.largeCar.texture.key) thumb.setAlpha(0.5); });
            thumb.on('pointerdown', () => {
                if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
                this.largeCar.setTexture(body.key);
                car.selectedBody = body.key;
                this.bodyOptions.forEach(t => t.setAlpha(0.5));
                thumb.setAlpha(1);
                this.showStart(car);
            });

            this.bodyOptions.push(thumb);
        });

        // Wheel selection thumbnails
        if (car.hasWheels !== false) {
            const wheelSpacingX = 80, wheelSpacingY = 50;
            this.wheelOptions = [];
            const wheelCenterX = 1010;

            this.wheels.forEach((wheel, i) => {
                const row = i < 3 ? 0 : 1;
                const col = i < 3 ? i : i - 3;
                const numCols = row === 0 ? 3 : 2;
                const startX = wheelCenterX - ((numCols - 1) * wheelSpacingX) / 2;
                const x = startX + col * wheelSpacingX;
                const y = 350 + row * wheelSpacingY;

                const choice = this.add.image(x, y, wheel.key + '_display')
                    .setScale(2)
                    .setInteractive()
                    .setAlpha(wheel.key === this.wheelChoice ? 1 : 0.5);

                choice.on('pointerover', () => choice.setAlpha(1));
                choice.on('pointerout', () => {
                    if (this.largeCarWheels && this.largeCarWheels.texture && wheel.key !== this.largeCarWheels.texture.key)
                        choice.setAlpha(0.5);
                });

                choice.on('pointerdown', () => {
                    if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
                    if (this.largeCarWheels && this.largeCarWheels.setTexture) {
                        this.largeCarWheels.setTexture(wheel.key);
                    }
                    this.wheelOptions.forEach(t => t.setAlpha(0.5));
                    choice.setAlpha(1);
                    car.selectedWheels = wheel.key;
                    this.wheelChoice = wheel.key;
                    this.showStart(car);
                });


                this.wheelOptions.push(choice);
            });
        }
    }


    showStart(car) {
        let playerData = this.registry.get("playerData");
        if (this.checkMark) this.checkMark.destroy();

        let selectedData = this.registry.get('selectedCarData') || {};
        let selectedBody = selectedData.body || this.registry.get('selectedBody');
        let selectedWheels = selectedData.wheels || this.registry.get('selectedWheels');
        let selectedCarKey = this.registry.get('selectedCar');

        let carBody = this.bodyChoice || (car.selectedBody || (car.bodies && car.bodies[0].key));
        let carWheels = this.wheelChoice || 'wheels';

        if (car.key === selectedData.type && car.selectedBody === selectedData.body && car.selectedWheels === selectedData.wheels) {
            this.checkMark = this.add.image(1220, 500, 'check').setScale(0.3);

            this.cars.forEach(c => c.colourBox.setVisible(false)); // hide all 
            car.colourBox.setVisible(true); // show selected

            // Add start button if not present
            if (!this.startButton) {
                this.startButton = this.add.image(1150, 610, 'btn_start').setInteractive().setScale(0.4);
                this.startButton.on('pointerover', () => this.startButton.setTint(0x888888));
                this.startButton.on('pointerout', () => this.startButton.clearTint());
                this.startButton.on('pointerdown', () => {
                    if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
                    this.registry.set('selectedCarData', {
                        body: this.bodyChoice,
                        wheels: this.wheelChoice || 'wheels',
                        type: this.CarChoice,
                        stage: playerData.unlockedCars[this.CarChoice] || 1
                    });
                    ModeSelection.showModeSelection(this, (mode) => {
                        this.registry.set('raceMode', mode);
                        //difficulty
                        ModeSelection.showDifficultySelection(this, (botSkill) => {
                            this.registry.set('botSkill', botSkill);
                            //track length
                            ModeSelection.showTrackLengthSelection(this, (trackLength) => {
                                this.registry.set('trackLength', trackLength);
                                this.registry.set('tutorialMode', false);
                                safeStartScene(this, 'RaceScene', RaceScene); // safely start the RaceScene
                            });
                        });
                    });
                });
            }
        }
    } // End of showStart(car)
}