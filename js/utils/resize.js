// resize cars so they are the same size in the race scene
export function resizeCar(carSprite, desiredHeight, groundY) {
    carSprite.setScale(1);           // reset scale
    carSprite.setOrigin(0.5, 1);     // bottom-center origin
    const visualHeight = carSprite.getBounds().height;
    let scaleFactor = desiredHeight / visualHeight;

    carSprite.y = groundY;           // place on ground
    //specific for troll car
    if (carSprite.texture.key === 'troll') {
        //make smaller
        scaleFactor *= 1.5;
    }
    else if (carSprite.texture.key === 'beater_jeep') {
        scaleFactor *= 0.8;
    }
    else if (carSprite.texture.key === 'beater_car') {
        scaleFactor *= 0.85;
    }
    carSprite.setScale(scaleFactor);
    carSprite.y = groundY;
}