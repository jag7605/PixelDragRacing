export default class MenuUi {
  constructor(scene) {
    this.scene = scene;
  }

  createButton(x, y, textureKey, label, baseScale, hoverScale, onClick, labelOffsetY = 75) {
    const btn = this.scene.add.image(x, y, textureKey)
      .setScale(baseScale)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setScale(hoverScale));
    btn.on('pointerout',  () => btn.setScale(baseScale));
    btn.on('pointerdown', onClick);

    return btn;
  }
}
