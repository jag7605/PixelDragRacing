export default class MenuUi {
  constructor(scene) {
    this.scene = scene;

  // Preload sound into scene so they’re ready
    this.clickSound = this.scene.sound.add('clickSound');
    this.hoverSound = this.scene.sound.add('hoverSound');

  }

  

  createButton(x, y, textureKey, label, baseScale, hoverScale, onClick, labelOffsetY = 75) {
    const btn = this.scene.add.image(x, y, textureKey)
      .setScale(baseScale)
      .setInteractive({ useHandCursor: true });

    if (label) {
      this.scene.add.bitmapText(x, y + labelOffsetY, 'pixelFont', label, 28)
        .setOrigin(0.5);
    }

    //hover sound
    btn.on('pointerover'
      , () => {
      btn.setScale(hoverScale);
      if( !this.scene.registry.get('sfxMuted')) this.hoverSound.play();
    });

    btn.on('pointerout',  () => btn.setScale(baseScale));

    //click sound
    btn.on('pointerdown', () => {
      if( !this.scene.registry.get('sfxMuted')) this.clickSound.play();
      onClick();
    });

    return btn;
  }
}
