// Helper function for word wrapping bitmapText
export function addWrappedTextArray(scene, container, startX, startY, textArray, font, fontSize, maxWidth, lineSpacing = 5, tint = 0xffffff) {
    let yOffset = 0;

    textArray.forEach(text => {
        const words = text.split(' ');
        let line = '';

        words.forEach(word => {
            const testLine = line + word + ' ';
            const testText = scene.add.bitmapText(0, 0, font, testLine, fontSize);
            if (testText.width > maxWidth) {
                container.add(
                    scene.add.bitmapText(startX, startY + yOffset, font, line.trim(), fontSize)
                        .setOrigin(0.5)
                        .setTint(tint)
                );
                yOffset += fontSize + lineSpacing;
                line = word + ' ';
            } else {
                line = testLine;
            }
            testText.destroy();
        });

        if (line.trim() !== '') {
            container.add(
                scene.add.bitmapText(startX, startY + yOffset, font, line.trim(), fontSize)
                    .setOrigin(0.5)
                    .setTint(tint)
            );
            yOffset += fontSize + lineSpacing;
        }
    });

    return yOffset;
}