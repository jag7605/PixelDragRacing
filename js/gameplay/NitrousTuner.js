export default class NitrousTuner {
    constructor(scene) {
        this.scene = scene;
        this.isDragging = false;
        this.selectedTuning = null;
        
        // TUNING CONFIGURATION - can edit these values to adjust the tuning options
        this.tuningPresets = [
            { time: 7500, power: 1.5, label: '7.5s' },  // Low power, long duration
            { time: 5000, power: 2.0, label: '5s' },    // Medium power, medium duration
            { time: 2500, power: 2.5, label: '2.5s' }   // High power, short duration
        ];
        
        // UI CONFIGURATION - Edit these to adjust layout
        this.config = {
            // Box dimensions and position
            boxX: 440,
            boxY: 250,
            boxWidth: 400,
            boxHeight: 200,
            boxRadius: 15,
            
            // Slider dimensions
            sliderY: 360,
            sliderWidth: 200,
            sliderHeight: 10,
            handleRadius: 12,
            
            // Colors
            boxColor: 0x000000,
            boxAlpha: 0.5,
            borderColor: 0x333333,
            titleColor: 0xff0000,
            sliderColor: 0xffffff,
            sliderAlpha: 0.7,
            handleColor: 0xFF0000,
            
            // Font sizes
            titleSize: 24,
            labelSize: 12,
            valueSize: 16,
            
            // Text positions
            titleY: 275,
            durationLabelY: 320,
            durationValueY: 340,
            powerLabelY: 390,
            powerValueY: 410,
            closeButtonX: 850,
            closeButtonY: 240
        };
        
        this.createOverlay();
    }

    createOverlay() {
        const cfg = this.config;
        const centerX = cfg.boxX + cfg.boxWidth / 2; // 640
        const barX = centerX - cfg.sliderWidth / 2; // 540
        const barY = cfg.sliderY;
        
        // Semi-transparent black background - make it stop event propagation
        this.overlayBg = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(5)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                pointer.event.stopPropagation();
            });

        // Centered black box with low opacity
        const boxGraphics = this.scene.add.graphics();
        boxGraphics.fillStyle(cfg.boxColor, cfg.boxAlpha);
        boxGraphics.fillRoundedRect(cfg.boxX, cfg.boxY, cfg.boxWidth, cfg.boxHeight, cfg.boxRadius);
        boxGraphics.lineStyle(4, cfg.borderColor, 1);
        boxGraphics.strokeRoundedRect(cfg.boxX, cfg.boxY, cfg.boxWidth, cfg.boxHeight, cfg.boxRadius);
        boxGraphics.setScrollFactor(0)
            .setDepth(6);

        // Title (centered)
        this.titleText = this.scene.add.bitmapText(centerX, cfg.titleY, 'pixelFont', 'NITROUS TUNING', cfg.titleSize)
            .setOrigin(0.5)
            .setTint(cfg.titleColor)
            .setScrollFactor(0)
            .setDepth(7);

        // Make the bar interactive for clicking to jump
        this.volumeBar = this.scene.add.rectangle(centerX, barY + cfg.sliderHeight/2, cfg.sliderWidth, cfg.sliderHeight, cfg.sliderColor, cfg.sliderAlpha)
            .setScrollFactor(0)
            .setDepth(7)
            .setInteractive()
            .on('pointerdown', (pointer) => {
                // Allow clicking on the bar to jump to that position
                this.updateSlider(pointer.x);
                this.isDragging = true;
            });

        // Marker positions (centered at 640)
        const markers = [
            { x: 560, time: 7500, power: 1.5, label: '7.5s' },
            { x: 640, time: 5000, power: 2.0, label: '5s' },
            { x: 720, time: 2500, power: 2.5, label: '2.5s' }
        ];
        this.markers = markers; // Store for updateSlider
        this.barX = barX; // Store for updateSlider
        
        const markerGraphics = this.scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(7);
        markers.forEach(m => {
            markerGraphics.fillStyle(0xffffff, 1);
            markerGraphics.fillCircle(m.x, barY + cfg.sliderHeight/2, 5);
        });

        // Handle - default to middle
        this.handle = this.scene.add.circle(640, barY + cfg.sliderHeight/2, cfg.handleRadius, cfg.handleColor)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(8);

        // Duration label (above slider, centered)
        this.durationLabel = this.scene.add.bitmapText(centerX, cfg.durationValueY, 'pixelFont', '5s', cfg.valueSize)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(8);

        // Power label (below slider, centered)
        this.powerLabel = this.scene.add.bitmapText(centerX, cfg.powerValueY, 'pixelFont', '1.8x', cfg.valueSize)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(8);

        // Add labels for Duration and Power
        this.durationTitleLabel = this.scene.add.bitmapText(centerX, cfg.durationLabelY, 'pixelFont', 'Duration:', cfg.labelSize)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(8);
        
        this.powerTitleLabel = this.scene.add.bitmapText(centerX, cfg.powerLabelY, 'pixelFont', 'Acceleration Power Rate:', cfg.labelSize)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(8);

        // Handle drag events
        this.handle.on('pointerdown', (pointer) => {
            this.isDragging = true;
            pointer.event.stopPropagation();
        });

        // Global pointer move handler
        this.pointerMoveHandler = (pointer) => {
            if (this.isDragging) {
                this.updateSlider(pointer.x);
            }
        };
        this.scene.input.on('pointermove', this.pointerMoveHandler);

        // Global pointer up handler
        this.pointerUpHandler = () => {
            if (this.isDragging) {
                this.isDragging = false;
                // Save the tuning when done dragging
                if (this.selectedTuning) {
                    this.scene.registry.set('nitrousTuning', this.selectedTuning);
                    if (!this.scene.registry.get('sfxMuted')) {
                        this.scene.sound.play('buttonSound');
                    }
                }
            }
        };
        this.scene.input.on('pointerup', this.pointerUpHandler);

        // Close button (top right corner of box)
        const closeButton = this.scene.add.text(cfg.closeButtonX, cfg.closeButtonY, 'X', { 
            font: 'bold 32px Arial', 
            fill: '#ffffff' 
        })
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(9);
        
        closeButton.on('pointerover', () => closeButton.setStyle({ fill: '#ff0000' }));
        closeButton.on('pointerout', () => closeButton.setStyle({ fill: '#ffffff' }));
        closeButton.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            if (!this.scene.registry.get('sfxMuted')) {
                this.scene.sound.play('buttonSound');
            }
            this.destroyOverlay();
        });

        // Store references for cleanup
        this.graphicsObjects = [boxGraphics, markerGraphics];
        this.textObjects = [this.titleText, this.durationLabel, this.powerLabel, this.durationTitleLabel, this.powerTitleLabel, closeButton];

        // Default to middle (5s)
        this.updateSlider(640);
    }

    updateSlider(x) {
        const barWidth = this.config.sliderWidth;
        
        // Clamp x to the bar boundaries
        x = Phaser.Math.Clamp(x, this.barX, this.barX + barWidth);
        
        // Find closest marker
        const closest = this.markers.reduce((prev, curr) =>
            Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev
        );
        
        // Snap handle to closest marker
        this.handle.x = closest.x;
        
        // Update selected tuning
        this.selectedTuning = { 
            power: closest.power, 
            duration: closest.time 
        };
        
        // Update labels
        this.durationLabel.setText(closest.label);
        this.powerLabel.setText(`${closest.power}x`);
    }

    destroyOverlay() {
        // Remove event listeners
        if (this.pointerMoveHandler) {
            this.scene.input.off('pointermove', this.pointerMoveHandler);
        }
        if (this.pointerUpHandler) {
            this.scene.input.off('pointerup', this.pointerUpHandler);
        }

        // Destroy graphics objects
        if (this.graphicsObjects) {
            this.graphicsObjects.forEach(obj => obj?.destroy());
        }

        // Destroy text objects
        if (this.textObjects) {
            this.textObjects.forEach(obj => obj?.destroy());
        }

        // Destroy other objects
        this.handle?.destroy();
        this.overlayBg?.destroy();
        this.volumeBar?.destroy();

        // Clear reference in scene
        this.scene.tuningOverlay = null;
    }
}