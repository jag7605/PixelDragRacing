export default class GarageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GarageScene' });
  }

  preload() {
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
    this.cameras.main.setBackgroundColor('#101015');

    

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

    this.add.text(W / 2, 60, 'Garage', {
      fontFamily: 'Arial',
      fontSize: 42,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Grid settings
    const cols = 3; // number of columns
    const cellW = 280; // horizontal spacing
    const cellH = 260; // vertical spacing
    const startX = W / 2 - ((cols - 1) * cellW) / 2;
    const startY = 180;

    const thumbScale = 0.7;    // thumbnail scale
    const nameOffset = 90;  // text distance from car image

    this.galleryItems = [];

    this.catalog.forEach((car, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * cellW;
      const y = startY + row * cellH;

     // Use a SPRITE and lock to frame 0 so it's just one car
      const thumb = this.add.sprite(x, y, car.key, 0)
        .setScale(thumbScale)
        .setInteractive({ useHandCursor: true }); 

      // Hover pop
      thumb.on('pointerover', () => thumb.setScale(thumbScale * 1.08));
      thumb.on('pointerout',  () => thumb.setScale(thumbScale));

      // Click → detail view
      thumb.on('pointerdown', () => this.showDetail(car));

      const label = this.add.text(x, y + nameOffset, car.name, {
        fontFamily: 'Arial',
        fontSize: 22,
        color: '#ffffff'
      }).setOrigin(0.5);

      this.galleryItems.push(thumb, label);
    });

    // Back to Menu
    const back = this.add.text(W / 2, H - 40, 'Back to Menu', {
      fontFamily: 'Arial',
      fontSize: 26,
      color: '#ff5a5a'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));

    this.galleryItems.push(back);
  }

  // Detail (single car view)
  showDetail(car) {
    const { width: W, height: H } = this.scale;
    this.clearScene();

    // Big view of car
    this.detailSprite = this.add.sprite(W / 2, H / 2, car.key, 0)
      .setOrigin(0.5)
      .setScale(1.1);


    // Back to gallery
    const back = this.add.text(80, H - 40, '⟵ Back', {
      fontFamily: 'Arial',
      fontSize: 26,
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.buildGallery());

    //Select button
    const select = this.add.text(W - 120, H - 40, 'Select', {
      fontFamily: 'Arial',
      fontSize: 26,
      color: '#00e676'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    select.on('pointerdown', () => {
     this.registry.set('selectedCar', car.key);   
    this.scene.start('RaceScene');    
    });

    this.activeItems = [this.detailSprite, back, select];
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