export default class MenuUi {
  constructor(scene) {
    this.scene = scene;

  // Preload sound into scene so they’re ready
    this.clickSound = this.scene.sound.add('clickSound');
  }

  

  createButton(x, y, textureKey, label, baseScale, hoverScale, onClick, labelOffsetY = 75) {
    const btn = this.scene.add.image(x, y, textureKey)
      .setScale(baseScale)
      .setInteractive({ useHandCursor: true });

    if (label) {
      this.scene.add.bitmapText(x, y + labelOffsetY, 'pixelFont', label, 28)
        .setOrigin(0.5);
    }

    btn.on('pointerover', () => btn.setScale(hoverScale));
    btn.on('pointerout',  () => btn.setScale(baseScale));

    //click sound
    btn.on('pointerdown', () => {
      this.clickSound.play();
      onClick();
    });

    return btn;
  }
}
