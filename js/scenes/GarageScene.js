export default class GarageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GarageScene' });
  }

  preload() {

    this.load.bitmapFont('pix', 'assets/ui/font/font.png', 'assets/ui/font/font.xml');

    this.load.image('btn_title',  'assets/ui/title.png');   // for "Back"
    this.load.image('btn_resume', 'assets/ui/resume.png');  // for "Select"

     // === Backgrounds ===
    this.load.image('garage_bg', 'assets/backgrounds/garage_bg.jpg');       // clear
    this.load.image('garage_bg_blur', 'assets/backgrounds/garage_bg_blur.jpg'); // blurred

    this.load.spritesheet('beater_car',  'assets/cars/beater_car_ride.png',  {
    frameWidth: 192,
    frameHeight: 192  
    });
    this.load.spritesheet('beater_jeep', 'assets/cars/beater_jeep_ride.png', {
    frameWidth: 256,
    frameHeight: 256
  });
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
      { key: 'beater_car',  name: 'Beater Car'  },
      { key: 'beater_jeep', name: 'Beater Jeep' }
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

    this.add.bitmapText(W / 2, 60 + 2, 'pix', 'Garage', 48)
      .setOrigin(0.5)
      .setTint(0x000000)
      .setAlpha(0.5);

    this.add.bitmapText(W / 2, 60, 'pix', 'Garage', 48)
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
      shadow.fillRoundedRect(-cardW/2 + 6, -cardH/2 + 8, cardW, cardH, radius);
      card.add(shadow);

      // --- Card background ---
      const bg = this.add.graphics();
      bg.fillStyle(0xEBD97A, 0.95); // yellow
      bg.lineStyle(3, 0xC8B765, 1); // darker outline
      bg.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
      bg.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
      card.add(bg);

      // Mask (clip inside rounded card) 
      const maskG = this.make.graphics({ x: x, y: y, add: false });
      maskG.fillStyle(0xffffff, 1);
      maskG.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
      const mask = maskG.createGeometryMask();
      card.setMask(mask);

     // Use a SPRITE and lock to frame 0 so it's just one car
      const thumb = this.add.sprite(0, CAR_Y_SHIFT, car.key, 0)
        .setScale(thumbScale);
        card.add(thumb);
        
        // --- Car label ---
        const labelY = cardH / 2 - nameOffset;
        const labelShadow = this.add.bitmapText(0, labelY + 2, 'pix', car.name, 22)
            .setOrigin(0.5)
            .setTint(0x000000)
            .setAlpha(0.5);

        const label = this.add.bitmapText(0, labelY, 'pix', car.name, 22)
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
        bg.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
        bg.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
      });
      hit.on('pointerout', () => {
        this.tweens.add({ targets: card, scale: 1.0, duration: 120, ease: 'Quad.easeOut' });
        bg.clear();
        bg.fillStyle(0xEBD97A, 0.95);
        bg.lineStyle(3, 0xC8B765, 1);
        bg.fillRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
        bg.strokeRoundedRect(-cardW/2, -cardH/2, cardW, cardH, radius);
      });

      hit.on('pointerdown', () => this.showDetail(car));
    });

    // Back to Menu
    const backY = H - 40;
    const backShadow = this.add.bitmapText(W / 2, backY + 2, 'pix', 'Back to Menu', 26)
      .setOrigin(0.5)
      .setTint(0x000000)
      .setAlpha(0.5);

    const back = this.add.bitmapText(W / 2, backY, 'pix', 'Back to Menu', 26)
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
    const PAD_X    = 120;       
    const BOOST    = 1.8;      

    // anchor bottom-center so wheels rest on the floor line
    this.detailSprite = this.add.sprite(W / 2, FLOOR_Y, car.key, 0)
    .setOrigin(0.5, 1);

    const frameW = this.detailSprite.frame.width;
    const frameH = this.detailSprite.frame.height;
    const maxW   = W - PAD_X * 2;

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
    const txtShadow = this.add.bitmapText(0, 4, 'pix', label, 26)
    .setOrigin(0.5).setTint(0x000000).setAlpha(0.5);
    const txt = this.add.bitmapText(0, 0, 'pix', label, 26)
    .setOrigin(0.5).setTint(tint);

     const w = img.displayWidth, h = img.displayHeight;
    const btn = this.add.container(x, y, [img, txtShadow, txt])
    .setSize(w, h)
    .setInteractive({ useHandCursor: true });

    // simple hover effect
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 100 }));
    btn.on('pointerout',  () => this.tweens.add({ targets: btn, scale: 1.00, duration: 100 }));
    btn.on('pointerdown', onClick);
    return btn;
};

    const backBtn = makeButton(100, H - 52, 'btn_title',  'Back',   0xffffff, () => {
    this.buildGallery();
    });
    const selectBtn = makeButton(W - 120, H - 52, 'btn_resume', 'Select', 0x00e676, () => {
    this.registry.set('selectedCar', car.key);
    this.scene.start('RaceScene');
    });

    // make sure they get cleaned up
    this.activeItems = [this.detailSprite, backBtn, selectBtn];

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