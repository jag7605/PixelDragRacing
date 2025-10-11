import { savePlayerDataFromScene } from '../utils/playerData.js';
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
    this.cars = [
      { key: 'beater_car', scale: 1.6, y: 80, cost: 0, level: 1, stage: 1, maxStage: 3 },
      { key: 'beater_jeep', scale: 1, y: 80, cost: 0, level: 1, stage: 1, maxStage: 3 },
      { key: 'ferrari_gw', scale: 1.8, y: 80, cost: 500, level: 1, stage: 1, maxStage: 3 },
      { key: 'porsche_yw', scale: 1.8, y: 80, cost: 700, level: 2, stage: 1, maxStage: 3 },
      { key: 'nissan_gw', scale: 1.6, y: 80, cost: 800, level: 3, stage: 1, maxStage: 3 },
      { key: 'troll', scale: 0.7, y: 70, cost: 1000, level: 5, stage: 1, maxStage: 3 },
    ];

    this.largeCar = null;
    this.selectButton = null;
    this.startButton = null;
    this.checkMark = null;
    this.checkMarkBox = null;
    this.selectBG = null;

    //display money

    this.add.image(30, 30, 'moneyIcon').setScale(0.03);
    this.moneyText = this.add.bitmapText(70, 20, 'pixelFont', `$${playerData.currency}`, 20).setOrigin(0, 0);

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
      const unlocked = playerData.unlockedCars.find(c => c[0] === car.key);

      // background box
      const box = this.add.image(x, 90, 'box').setOrigin(0.5).setScale(1.2, 0.5);

      //coloured box for selected car
      car.boxX = x;
      car.boxY = 90;

      car.colourBox = this.add.rectangle(car.boxX, car.boxY, 307.2, 128, 0x286935)
        .setOrigin(0.5)
        .setAlpha(0.7)
        .setVisible(car.key === this.selectedCarKey);

      //set locked cars
      let lockedText = '';
      if (!unlocked) {
        if (playerData.level < car.level) {
          lockedText = `LOCKED\nLEVEL ${car.level}\nREQUIRED`;
        } else {
          lockedText = `LOCKED\n$${car.cost}`;
        }
        car.costText = this.add.bitmapText(x, 90, 'pixelFont', lockedText, 20)
          .setOrigin(0.5)
          .setTint(0xff0000);
        car.LockedBox = this.add.rectangle(car.boxX, car.boxY, 307.2, 128, 0x555555)
          .setOrigin(0.5)
          .setAlpha(0.7);
      } else {
        if (car.costText) car.costText.destroy();
        box.clearTint();
      }
      // car sprite
      const sprite = this.add.sprite(x, car.y, car.key, 0).setScale(car.scale).setInteractive();
      sprite.on('pointerdown', () => {
        if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
        this.showLargeCar(car);
        this.showStart(car);
      });

      this.carContainer.add(car.colourBox);

      this.carContainer.add(sprite);
      if (car.LockedBox) this.carContainer.add(car.LockedBox);
      this.carContainer.add(box);
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

    // Show initial selected car after loop
    this.cars.forEach(car => {
      if (car.key == this.registry.get('selectedCar')) {
        this.showLargeCar(car);
        this.showStart(car);
      }
    });

    // Menu button
    const menuButton = this.add.image(1230, 50, 'menu').setInteractive().setScale(0.4);
    menuButton.on('pointerover', () => menuButton.setTint(0x888888));
    menuButton.on('pointerout', () => menuButton.clearTint());
    menuButton.on('pointerdown', () => {
      if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
      this.scene.start('MenuScene');
    });

  }

  showLargeCar(car) {
    let playerData = this.registry.get("playerData");
    const unlocked = playerData.unlockedCars.find(c => c[0] === car.key);


    // Destroy previous large car, buttons
    if (this.largeCar) this.largeCar.destroy();
    if (this.selectButton) this.selectButton.destroy();
    if (this.selectBG) this.selectBG.destroy();

    this.checkMarkBox = this.add.image(1220, 500, 'box').setScale(0.2);


    //button position
    let buttonX = 1010;
    let buttonY = 500;
    if (playerData.level < car.level) {
      buttonX = 990;
    }

    this.selectBG = this.add.image(buttonX, buttonY, 'select').setOrigin(0.5).setScale(0.6, 0.5);

    const fixedBottomY = 550;
    // Large car preview
    this.largeCar = this.add.sprite(640, 300, car.key, 0).setScale(car.scale + 0.8);
    this.largeCar.setOrigin(0.5, 1);
    this.largeCar.y = fixedBottomY;

    // Select/unlock button
    let buttonText = "SELECT";
    let size = 32;
    if (!unlocked) {
      buttonText = `BUY - $${car.cost}`;
      size = 22;
    }

    //check if reaches level requirement

    if (playerData.level < car.level) {
      this.selectBG.setScale(0.72, 0.5);
      buttonText = `LEVEL ${car.level} REQUIRED`;
      size = 22;
    }

    this.selectButton = this.add.bitmapText(buttonX, buttonY, 'pixelFont', buttonText, size)
      .setOrigin(0.5)
      .setInteractive()
      .setTint(0xffffff);

    this.selectButton.on('pointerover', () => this.selectButton.setTint(0x800b0b));
    this.selectButton.on('pointerout', () => this.selectButton.setTint(0xffffff));

    this.selectButton.on('pointerdown', () => {
      if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');
      if (!unlocked) {
        //attempt to buy
        if (playerData.currency >= car.cost) {
          if (playerData.level < car.level) {
            //level too low
            this.selectButton.setText(`LEVEL ${car.level} \nREQUIRED`);
            this.selectButton.setFontSize(22);
            this.selectButton.setPosition(900, 500);
            return; // exit without buying
          }
          //buy car
          playerData.currency -= car.cost;
          playerData.unlockedCars.push([car.key, 1]); // add car with initial stage 1

          //update money display
          this.moneyText.setText(`$${playerData.currency}`);

          //remove locked text and box
          if (car.costText) car.costText.destroy();
          if (car.LockedBox) car.LockedBox.destroy();

          //show selected box
          car.colourBox.setVisible(true);

          //change button to select
          this.selectButton.setText("SELECT");
          this.selectButton.setFontSize(32);

          // Save updated player back to registry
          this.registry.set("playerData", playerData);

          //save to localStorage
          savePlayerDataFromScene(this);

          //reload large car to show upgrade options
          this.showLargeCar(car);
        }
        else {
          //not enough money
          this.selectButton.setText("NOT ENOUGH $");
          this.selectButton.setFontSize(22);
          return; // exit without selecting
        }
      }
      this.registry.set('selectedCar', car.key);
      this.showStart(car);
    });

    // === Upgrade System ===
    const unlockedCar = playerData.unlockedCars.find(c => c[0] === car.key);
    const currentStage = this.registry.get('upgrades')[car.key] || 1;
    const maxStage = car.maxStage;

    // remove any previous ui
    if (this.stageInfoText) this.stageInfoText.destroy();
    if (this.upgradeBtn) this.upgradeBtn.destroy();
    if (this.upgradeLabel) this.upgradeLabel.destroy();
    if (this.infoBox) this.infoBox.destroy();

    //display grey text box behind check mark
    const infoBox = this.add.image(190, 350, 'greySquare').setScale(0.4, 0.6);

    //stage info text

    this.stageInfoText = this.add.bitmapText(50, 230, 'pixelFont',
      `CAR: \n${car.key.toUpperCase()}\nSTAGE: ${currentStage}/${maxStage}
      \n0 - 100 Time: \n${[0, 7, 4, 2.5][currentStage]} Seconds`, 20)
      .setOrigin(0, 0)
      .setTint(0xffffff)
      .setLineSpacing(30);

    // Only show upgrade button if car is unlocked and not maxed
    if (unlocked && currentStage < maxStage) {
      const upgradeCost = currentStage * 150 + 150; // cost scaling
      this.upgradeBtn = this.add.image(50, 450, 'btn_resume')
        .setScale(0.5)
        .setInteractive()
        .setOrigin(0, 0.5);
      this.upgradeLabel = this.add.bitmapText(60, 450, 'pixelFont',
        `UPGRADE ($${upgradeCost})`, 17.5)
        .setOrigin(0, 0.5);

      // Hover effect
      this.upgradeBtn.on('pointerover', () => this.upgradeBtn.setTint(0xdddd00));
      this.upgradeBtn.on('pointerout', () => this.upgradeBtn.clearTint());

      this.upgradeBtn.on('pointerdown', () => {
        if (playerData.currency < upgradeCost) {
          this.upgradeLabel.setText("NOT ENOUGH $");
          this.upgradeLabel.setTint(0xff0000);
          return;
        }

        // Confirmation window
        const confirmBox = this.add.rectangle(640, 360, 700, 200, 0x000000, 0.8);
        const confirmText = this.add.bitmapText(640, 320, 'pixelFont',
          `Upgrade ${car.key.toUpperCase()} to Stage ${currentStage + 1}?`, 24)
          .setOrigin(0.5);
        const yesBtn = this.add.bitmapText(590, 380, 'pixelFont', 'YES', 22)
          .setOrigin(0.5)
          .setTint(0x00e676)
          .setInteractive();
        const noBtn = this.add.bitmapText(690, 380, 'pixelFont', 'NO', 22)
          .setOrigin(0.5)
          .setTint(0xff5a5a)
          .setInteractive();

        yesBtn.on('pointerdown', () => {
          let upgrades = this.registry.get('upgrades');
          // Deduct money and upgrade stage
          playerData.currency -= upgradeCost;
          upgrades[car.key] = currentStage + 1;
          unlockedCar[1] = currentStage + 1;

          // Update registry upgrades
          this.registry.set('upgrades', upgrades);
          this.registry.set('playerData', playerData);

          // Save progress
          this.registry.set("playerData", playerData);
          savePlayerDataFromScene(this);

          // Notification text
          const notify = this.add.bitmapText(640, 360, 'pixelFont',
            `UPGRADED TO STAGE ${currentStage + 1}!`, 32)
            .setOrigin(0.5)
            .setTint(0x00ff00)
            .setAlpha(0)
            .setDepth(1);
          this.tweens.add({
            targets: notify,
            alpha: 1,
            duration: 300,
            yoyo: true,
            hold: 800,
            onComplete: () => notify.destroy()
          });

          confirmBox.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
          this.moneyText.setText(`$${playerData.currency}`);
          this.showLargeCar(car); // refresh UI
        });

        noBtn.on('pointerdown', () => {
          confirmBox.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
        });
      });
    } else if (currentStage >= maxStage && unlockedCar) {
      // Maxed out label
      this.add.image(50, 450, 'btn_resume')
        .setScale(0.5)
        .setInteractive()
        .setOrigin(0, 0.5);
      this.add.bitmapText(60, 450, 'pixelFont',
        `MAX LEVEL`, 17.5)
        .setOrigin(-0.25, 0.5);
    }

  }

  showStart(car) {
    if (this.checkMark) this.checkMark.destroy();

    if (car.key == this.registry.get('selectedCar')) {

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
          this.showModeSelection();
        });

        this.add.bitmapText(1150, 670, 'pixelFont', 'START GAME', 20).setOrigin(0.5);
      }
    }
  }

  showModeSelection() {
    // Semi-transparent background

    const shadow = this.add.rectangle(642, 362, 400, 250, 0x000000, 0.3).setOrigin(0.5);
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);

    const box = this.add.rectangle(640, 360, 400, 250, 0xffffff, 0.9).setStrokeStyle(4, 0x000000);

    this.add.bitmapText(640, 280, 'pixelFont', 'SELECT MODE', 30)
      .setTint(0x990000)
      .setOrigin(0.5);

    // Day button
    const dayBtn = this.add.image(550, 360, 'dayIcon').setInteractive().setScale(0.4);
    const nightBtn = this.add.image(730, 360, 'nightIcon').setInteractive().setScale(0.5);

    this.add.bitmapText(550, 420, 'pixelFont', 'DAY', 18)
      .setTint(0xFFA500)
      .setOrigin(0.5);
    this.add.bitmapText(730, 420, 'pixelFont', 'NIGHT', 18)
      .setTint(0x000066)
      .setOrigin(0.5);

    dayBtn.on('pointerover', () => dayBtn.setTint(0xFFD580));
    dayBtn.on('pointerout', () => dayBtn.clearTint());

    nightBtn.on('pointerover', () => nightBtn.setTint(0xFF5555));
    nightBtn.on('pointerout', () => nightBtn.clearTint());

    const cleanup = () => {
      overlay.destroy();
      box.destroy();
      dayBtn.destroy();
      nightBtn.destroy();
      this.children.list
        .filter(obj => obj.text === 'DAY' || obj.text === 'NIGHT' || obj.text === 'SELECT MODE')
        .forEach(obj => obj.destroy());
    };

    dayBtn.on('pointerdown', () => {
      this.registry.set('raceMode', 'day');
      cleanup();
      this.scene.start('RaceScene');
    });

    nightBtn.on('pointerdown', () => {
      this.registry.set('raceMode', 'night');
      cleanup();
      this.scene.start('RaceScene');
    });
  }
}