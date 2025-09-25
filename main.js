// Import all scenes
import DevSceneSwitch from './js/scenes/DevSceneSwitch.js';
import BootScene from './js/scenes/BootScene.js';
import EndScene from './js/scenes/EndScene.js';
import MenuScene from './js/scenes/MenuScene.js';
import PauseScene from './js/scenes/PauseScene.js';
import RaceScene from './js/scenes/RaceScene.js';
import InfoScene from './js/scenes/InfoScene.js';
import SettingsScene from './js/scenes/SettingsScene.js';


// Phaser game configuration (preserving your prototype settings)
const config = {
    type: Phaser.AUTO, // Let Phaser choose the best renderer (WebGL or Canvas)
    width: 1280, // Game width in pixels
    height: 720, // Game height in pixels
    parent: 'game-container', // Parent HTML element for scaling
    scale: {
        mode: Phaser.Scale.FIT, // Fit the game to the parent while maintaining aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game in the parent
    },
    physics: {
        default: 'arcade', // Simple physics system for 2D movement
    },
    scene: [
        DevSceneSwitch, // Start with the dev switcher
        BootScene,
        EndScene,
        MenuScene,
        PauseScene,
        RaceScene,
        InfoScene,
        SettingsScene
    ]
};

// Create a new Phaser game instance
const game = new Phaser.Game(config);

console.log('Game initialized'); // Debug log to confirm game starts