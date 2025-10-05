export default class GarageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GarageScene' });
  }

  create() {
    const { width: W, height: H } = this.scale;

    // === Backgrounds (created once, toggled later) ===
    this.bgClear = this.add.image(W / 2, H / 2, 'garage_bg')
      .setDisplaySize(W, H)
      .setDepth(-10)
      .setVisible(false);

    this.bgBlur = this.add.image(W / 2, H / 2, 'garage_bg_blur')
      .setDisplaySize(W, H)
      .setDepth(-10)
      .setVisible(true);

    // Catalog: add more cars here easily
    this.catalog = [
      { key: 'beater_car', name: 'Beater Car', baseMaxSpeed: 280 },
      { key: 'beater_jeep', name: 'Beater Jeep', baseMaxSpeed: 280 }
    ];

    // Start in gallery mode
    this.buildGallery();


  }

  //Gallery (grid)
  buildGallery() {
    const { width: W, height: H } = this.scale;
    this.clearScene();

    // toggle backgrounds
    this.bgBlur.setVisible(true);
    this.bgClear.setVisible(false);

    this.add.bitmapText(W / 2, 60 + 2, 'pixelFont', 'Garage', 48)
      .setOrigin(0.5)
      .setTint(0x000000)
      .setAlpha(0.5);

    this.add.bitmapText(W / 2, 60, 'pixelFont', 'Garage', 48)
      .setOrigin(0.5)
      .setTint(0xffffff);


    // Grid settings
    const cols = 3; // number of columns
    const cellW = 280; // horizontal spacing
    const cellH = 260; // vertical spacing
    const startX = W / 2 - ((cols - 1) * cellW) / 2;
    const startY = 180;

    // Card style
    const cardW = 260;
    const cardH = 160;
    const radius = 20;
    const thumbScale = 0.7;    // thumbnail scale
    const nameOffset = 40;  // text distance from car image

    const CAR_Y_SHIFT = -60;

    this.galleryItems = [];

    this.catalog.forEach((car, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * cellW;
      const y = startY + row * cellH;

      // --- Card container ---
      const card = this.add.container(x, y);
      card.setDepth(1);
      this.galleryItems.push(card);

      // --- Shadow ---
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.25);
      shadow.fillRoundedRect(-cardW / 2 + 6, -cardH / 2 + 8, cardW, cardH, radius);
      card.add(shadow);

      // --- Card background ---
      const bg = this.add.graphics();
      bg.fillStyle(0xEBD97A, 0.95); // yellow
      bg.lineStyle(3, 0xC8B765, 1); // darker outline
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
      card.add(bg);

      // Mask (clip inside rounded card) 
      const maskG = this.make.graphics({ x: x, y: y, add: false });
      maskG.fillStyle(0xffffff, 1);
      maskG.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
      const mask = maskG.createGeometryMask();
      card.setMask(mask);

      // Use a SPRITE and lock to frame 0 so it's just one car
      const thumb = this.add.sprite(0, CAR_Y_SHIFT, car.key, 0)
        .setScale(thumbScale);
      card.add(thumb);

      // --- Car label ---
      const labelY = cardH / 2 - nameOffset;
      const labelShadow = this.add.bitmapText(0, labelY + 2, 'pixelFont', car.name, 22)
        .setOrigin(0.5)
        .setTint(0x000000)
        .setAlpha(0.5);

      const label = this.add.bitmapText(0, labelY, 'pixelFont', car.name, 22)
        .setOrigin(0.5)
        .setTint(0xffffff);

      card.add(labelShadow);
      card.add(label);

      // --- Interactive zone ---
      const hit = this.add.zone(0, 0, cardW, cardH).setOrigin(0.5).setInteractive({ useHandCursor: true });
      card.add(hit);

      hit.on('pointerover', () => {
        this.tweens.add({ targets: card, scale: 1.06, duration: 120, ease: 'Quad.easeOut' });
        bg.clear();
        bg.fillStyle(0xEDE089, 0.98);
        bg.lineStyle(3, 0x9C8E48, 1);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
      });
      hit.on('pointerout', () => {
        this.tweens.add({ targets: card, scale: 1.0, duration: 120, ease: 'Quad.easeOut' });
        bg.clear();
        bg.fillStyle(0xEBD97A, 0.95);
        bg.lineStyle(3, 0xC8B765, 1);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, radius);
      });

      hit.on('pointerdown', () => this.showDetail(car));
    });

    // Back to Menu
    const backY = H - 40;
    const backShadow = this.add.bitmapText(W / 2, backY + 2, 'pixelFont', 'Back to Menu', 26)
      .setOrigin(0.5)
      .setTint(0x000000)
      .setAlpha(0.5);

    const back = this.add.bitmapText(W / 2, backY, 'pixelFont', 'Back to Menu', 26)
      .setOrigin(0.5)
      .setTint(0xff5a5a)
      .setInteractive({ useHandCursor: true });

    back.on('pointerdown', () => this.scene.start('MenuScene'));

    this.galleryItems.push(backShadow, back);
  }

  // Detail (single car view)
  showDetail(car) {
    const { width: W, height: H } = this.scale;
    this.clearScene();

    // toggle backgrounds
    this.bgClear.setVisible(true);
    this.bgBlur.setVisible(false);

    // Big view of car
    const FLOOR_Y = H - 40;
    const TARGET_H = H * 1;
    const PAD_X = 120;
    const BOOST = 1.8;

    // anchor bottom-center so wheels rest on the floor line
    this.detailSprite = this.add.sprite(W / 2, FLOOR_Y, car.key, 0)
      .setOrigin(0.5, 1);

    const frameW = this.detailSprite.frame.width;
    const frameH = this.detailSprite.frame.height;
    const maxW = W - PAD_X * 2;

    // fit by both height and width
    const scale = Math.min(TARGET_H / frameH, maxW / frameW) * BOOST;

    this.detailSprite.setScale(scale);

    // labeled image button in a container
    const makeButton = (x, y, key, label, tint, onClick, targetH = 58) => {
      const img = this.add.image(0, 0, key).setOrigin(0.5);

      // scale image to a target height for consistent size
      const s = targetH / img.height;
      img.setScale(s);

      // label 
      const txtShadow = this.add.bitmapText(0, 4, 'pixelFont', label, 26)
        .setOrigin(0.5).setTint(0x000000).setAlpha(0.5);
      const txt = this.add.bitmapText(0, 0, 'pixelFont', label, 26)
        .setOrigin(0.5).setTint(tint);

      const w = img.displayWidth, h = img.displayHeight;
      const btn = this.add.container(x, y, [img, txtShadow, txt])
        .setSize(w, h)
        .setInteractive({ useHandCursor: true });

      // simple hover effect
      btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 100 }));
      btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1.00, duration: 100 }));
      btn.on('pointerdown', onClick);
      return btn;
    };

    const backBtn = makeButton(100, H - 52, 'title', 'Back', 0xffffff, () => {
      this.buildGallery();
    });
    const selectBtn = makeButton(W - 120, H - 52, 'btn_resume', 'RACE!', 0x00e676, () => {
      this.registry.set('selectedCar', car.key);
      this.scene.start('RaceScene');
    });

    // make sure they get cleaned up
    this.activeItems = [this.detailSprite, backBtn, selectBtn];

    // Fetch current stage from registry
    const upgrades = this.registry.get('upgrades') || {};
    const currentStage = upgrades[car.key] || 1;

    // New: Display current stage and max speed in top left (smaller, compact)
    const stageText = this.add.bitmapText(20, 50, 'pixelFont',
      `Car: ${car.name}
    \nCurrent Upgrade Stage: ${currentStage}/3
    \n0 - 100 Time: ${[0, 7, 4, 2.5][currentStage]} Seconds`, 20)
      .setOrigin(0, 0)  // Align to top left
      .setDropShadow(2, 2, 0x000000, 0.5)
      .setTint(0xffffff);
    this.activeItems.push(stageText);

    // Placeholder for cash and level at the bottom of the screen
    const cashLevelText = this.add.bitmapText(W / 2, H - 20, 'pixelFont',
      `Cash: \$0\n\nLevel: 1`, 20)
      .setOrigin(0.5, 1)  // Align to bottom center
      .setDropShadow(2, 2, 0x000000, 0.5)  // Subtle shadow for consistency
      .setTint(0xffffff);
    this.activeItems.push(cashLevelText);

    // New: Upgrade button in top right (ensure text fits, adjust scale)
    if (currentStage < 3) {
      const targetHeight = 40;  // Smaller button height
      // Custom button creation without shadow
      const upgradeBtnImg = this.add.image(0, 0, 'btn_resume').setOrigin(0.5);
      const s = targetHeight / upgradeBtnImg.height;
      upgradeBtnImg.setScale(s);

      const upgradeText = this.add.bitmapText(0, 0, 'pixelFont', `Upgrade to Stage ${currentStage + 1}`, 26.5)
        .setOrigin(0.5)
        .setDropShadow(2, 2, 0x000000, 0.5)  // Subtle shadow like stats
        .setTint(0xffd700);

      const upgradeBtn = this.add.container(W - 200, 100, [upgradeBtnImg, upgradeText])
        .setSize(upgradeBtnImg.displayWidth, targetHeight)
        .setInteractive({ useHandCursor: true });

      // Set initial scale explicitly
      const btnScale = 0.75;  // Consistent scale
      upgradeBtn.setScale(btnScale);
      upgradeBtn.list.forEach(item => item.setScale(btnScale));  // Scale all elements

      // Hover effect
      upgradeBtn.on('pointerover', () => this.tweens.add({
        targets: upgradeBtn,
        scale: btnScale * 1.05,  // Scale from initial size
        duration: 100,
        ease: 'Quad.easeOut'
      }));
      upgradeBtn.on('pointerout', () => this.tweens.add({
        targets: upgradeBtn,
        scale: btnScale,  // Back to initial size
        duration: 100,
        ease: 'Quad.easeOut'
      }));
      upgradeBtn.on('pointerdown', () => {
        // Create confirmation window
        const confirmWindow = this.add.container(W / 2, H / 2);
        const background = this.add.rectangle(0, 0, 700, 200, 0x000000, 0.8).setOrigin(0.5);
        const confirmText = this.add.bitmapText(0, -40, 'pixelFont', `Confirm Upgrade to Stage ${currentStage + 1}?`, 24).setOrigin(0.5).setTint(0xffffff);

        const yesButton = makeButton(100, 40, 'btn_resume', 'Yes', 0x00e676, () => {
          upgrades[car.key] = currentStage + 1;
          this.registry.set('upgrades', upgrades);
          confirmWindow.destroy();  // Remove confirmation window
          // Add upgrade notification
          const notifyText = this.add.bitmapText(W / 2, H / 2, 'pixelFont', `UPGRADED TO STAGE ${currentStage + 1}!`, 36)
            .setOrigin(0.5)
            .setTint(0x00ff00)
            .setAlpha(0)
            .setDropShadow(3, 3, 0x000000, 0.7)
            .setDepth(5);
          this.tweens.add({
            targets: notifyText,
            alpha: 1,
            scale: 1.5,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
              this.tweens.add({
                targets: notifyText,
                alpha: 0,
                scale: 1,
                duration: 500,
                delay: 1000,
                ease: 'Quad.easeIn',
                onComplete: () => notifyText.destroy()
              });
            }
          });
          this.showDetail(car);  // Refresh view
        });

        const noButton = makeButton(-100, 40, 'title', 'No', 0xff5a5a, () => {
          confirmWindow.destroy();  // Remove confirmation window
        });

        confirmWindow.add([background, confirmText, yesButton, noButton]);
        this.galleryItems.push(confirmWindow);  // Keep track of the confirmation window
      });

      this.activeItems.push(upgradeBtn);
    } else {
      const maxedText = this.add.bitmapText(W - 20, 50, 'pixelFont', 'Max Stage Reached', 20)
        .setOrigin(1, 0)  // Align to top right
        .setDropShadow(2, 2, 0x000000, 0.5)
        .setTint(0xffd700);
      this.activeItems.push(maxedText);
    }
  }

  clearScene() {
    // remove any previously added gallery/detail items
    if (this.galleryItems) {
      this.galleryItems.forEach(o => o.destroy());
      this.galleryItems = null;
    }
    if (this.activeItems) {
      this.activeItems.forEach(o => o.destroy());
      this.activeItems = null;
    }
  }
}