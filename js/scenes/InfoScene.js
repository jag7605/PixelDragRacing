import { addWrappedTextArray } from '../utils/wordWrap.js';

export default class InfoScene extends Phaser.Scene {
    constructor() {
        super('InfoScene');
}
    create() {

        //Full-screen semi-transparent background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setInteractive().setDepth(0);

        // Yellow square in the center
        const yellowBox = this.add.image(640, 360, 'yellowSquare').setOrigin(0.5);

        //scrollable container
        this.container = this.add.container(0, 0).setDepth(1);

        //add padding and spacing
        const topPadding = 20; // adjust this to taste
        const sidePadding = 20; // adjust this to taste

        //create a mask for the container to limit visible area
        const shape = this.make.graphics();
        shape.fillStyle(0xffffff);
        shape.fillRect(
            yellowBox.x - yellowBox.displayWidth / 2 + sidePadding,
            yellowBox.y - yellowBox.displayHeight / 2 + topPadding,
            yellowBox.displayWidth - sidePadding * 2,
            yellowBox.displayHeight - topPadding - sidePadding 
        ); // x, y, width, height
        const mask = shape.createGeometryMask();
        this.container.setMask(mask);

        //title image
        this.container.add(this.add.image(640, 150, 'title').setOrigin(0.5).setScale(1.2, 0.7));

        // how to play text
        this.container.add(this.add.bitmapText(645, 155, 'pixelFont', 'HOW TO PLAY', 40).setOrigin(0.5));

        //description text
        const description = [
            "Welcome to Pixel Drag Racing! Rev your engines and get ready for fast-paced, head-to-head action. In this arcade thrill ride, victory comes down to one thing, perfect timing. Nail your shifts, outpace your opponents, and claim your spot on top. Do you have the timing, the focus, and the guts to be the fastest on the track? Let’s find out!"
        ];
        addWrappedTextArray(
            this, this.container, 640, 220, description, 'pixelFont', 12.5,
            yellowBox.displayWidth - 40, 5, 0x852020
        );
        // controls list
        const controls = [
            { key: 'UP', action: 'Accelerate' },
            { key: 'DOWN', action: 'Brake' },
            { key: 'E', action: 'Shift Up' },
            { key: 'Q', action: 'Shift Down' },
            { key: 'SPACE', action: 'Use Nitrous' },
        ];

        //controls text
        
        this.container.add(this.add.bitmapText(640, 360, 'pixelFont', 'Controls:', 30).setOrigin(0.5).setTint(0x852020));
        //display controls
        controls.forEach((control, index) => {
            this.container.add(this.add.bitmapText(500, 405 + index * 30, 'pixelFont', control.action, 20).setOrigin(0.5).setTint(0x852020));
            this.container.add(this.add.bitmapText(850, 405 + index * 30, 'pixelFont', control.key, 20).setOrigin(0.5).setTint(0x852020));
        });

        //add tips
        const tips = [
            "- Shift perfectly to gain a speed boost",
            "- Use Nitrous wisely, it has cooldown",
            "- Beat your opponent to the finish line!",
            "- Avoid late or early shifts — mistimed shifts slow you down.",
            "- Customise your car in the garage!",
            "- Practice makes perfect!"
        ];

        this.container.add(this.add.bitmapText(640, 600, 'pixelFont', 'Tips:', 30).setOrigin(0.5).setTint(0x852020));
        addWrappedTextArray(
            this, this.container, 640, 650, tips, 'pixelFont', 15,
            yellowBox.displayWidth - 40, 5, 0x852020
        );

        //scrollable area
        this.scrollY = 0;
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY -= deltaY * 0.5; // sensitivity
            this.scrollY = Phaser.Math.Clamp(this.scrollY, -400, 0); // adjust limit to content height
            this.container.y = this.scrollY;
        });

        //draggable scroll bar
        const scrollBarHeight = (yellowBox.displayHeight - topPadding - sidePadding) * (yellowBox.displayHeight - topPadding - sidePadding) / (yellowBox.displayHeight - topPadding - sidePadding + 400); 
        const scrollBar = this.add.rectangle(
            yellowBox.x + yellowBox.displayWidth / 2 - sidePadding / 2,
            yellowBox.y - yellowBox.displayHeight / 2 + topPadding + scrollBarHeight / 2,
            10,
            scrollBarHeight,
            0xaaaaaa
        ).setOrigin(0.5).setDepth(2).setInteractive({ draggable: true });

        scrollBar.on('drag', (pointer, dragX, dragY) => {
            const minY = yellowBox.y - yellowBox.displayHeight / 2 + topPadding + scrollBarHeight / 2;
            const maxY = yellowBox.y + yellowBox.displayHeight / 2 - sidePadding - scrollBarHeight / 2;
            scrollBar.y = Phaser.Math.Clamp(dragY, minY, maxY);
            const scrollPercent = (scrollBar.y - minY) / (maxY - minY);
            this.scrollY = -scrollPercent * 400; 
            this.container.y = this.scrollY;
        });

        //mouse scrolling also moves the scroll bar
        this.input.on('wheel', () => {
            const minY = yellowBox.y - yellowBox.displayHeight / 2 + topPadding + scrollBarHeight / 2;
            const maxY = yellowBox.y + yellowBox.displayHeight / 2 - sidePadding - scrollBarHeight / 2;
            const scrollPercent = -this.scrollY / 400; 
            scrollBar.y = Phaser.Math.Clamp(minY + scrollPercent * (maxY - minY), minY, maxY);
        });

        // x in corner to close
        const closeButton = this.add.text(1050, 100, 'X', { font: '40px Arial', fill: '#ffffff' })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(2);

        //"Play Tutorial" button
        const btnY = yellowBox.y + yellowBox.displayHeight / 2 - 70; // near bottom of yellow card
        const playTut = this.add.container(640, btnY)
        .setDepth(2)
        .setSize(320, 64)
        .setInteractive({ useHandCursor: true });

        // background
        const btnBg = this.add.rectangle(0, 0, 400, 64, 0x333333, 1)
        .setOrigin(0.5)
        .setStrokeStyle(3, 0xff0000, 1);
        playTut.add(btnBg);

        //label
        const btnTxt = this.add.bitmapText(0, 0, 'pixelFont', 'PLAY TUTORIAL', 28)
        .setOrigin(0.5)
        .setTint(0xffffff);
        playTut.add(btnTxt);

        // hover effects
        playTut.on('pointerover', () => btnBg.setFillStyle(0x444444, 1));
        playTut.on('pointerout',  () => btnBg.setFillStyle(0x333333, 1));

        // click -> launch tutorial
        playTut.on('pointerdown', () => {
        if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

        // mark tutorial mode if you use this flag
        this.registry.set('tutorialMode', true);

        // close overlays and menu cleanly
        if (this.scene.isPaused('MenuScene')) this.scene.stop('MenuScene');
        this.scene.stop('InfoScene');

        // start guided tutorial race
        this.scene.start('TutorialRaceScene');
        });
            
        closeButton.on('pointerover', () => {
            closeButton.setStyle({ fill: '#ff0000' });
        });
        closeButton.on('pointerout', () => {
            closeButton.setStyle({ fill: '#ffffff' });
        });

        closeButton.on('pointerdown', () => {
            if (!this.registry.get('sfxMuted')) this.sound.play('buttonSound');

            if (this.scene.isPaused('MenuScene')) {
                this.scene.resume('MenuScene');
            }
            if (this.scene.isPaused('SettingsScene')) {
                this.scene.resume('SettingsScene');
            }

            if (this.scene.isPaused('PauseScene')) {
                this.scene.resume('PauseScene');
            }

            this.scene.stop();
        });

    }

    
}
