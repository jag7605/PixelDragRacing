// resize cars so they are the same size in the race scene
export function resizeCar(carSprite, desiredHeight, groundY, scale, bigger) {
    carSprite.setScale(1);           // reset scale
    carSprite.setOrigin(0.5, 1);     // bottom-center origin
    const visualHeight = carSprite.getBounds().height;
    let scaleFactor = desiredHeight / visualHeight;

    carSprite.y = groundY;           // place on ground
    if(!scale == 0){
        carSprite.setScale((scaleFactor + 0.5) * scale, scaleFactor);
    }
    else if (bigger === true){
        carSprite.setScale(scaleFactor * 1.5);
    }
    else{
        carSprite.setScale(scaleFactor);
    }
    
    carSprite.y = groundY;
}