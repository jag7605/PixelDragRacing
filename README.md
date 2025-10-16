# PixelDragRacing

PixelDragRacing is a web-based drag racing game that focuses on fast-paced pixel-art racing experiences. This repository contains all the source code required to run and modify the game.​

## Features

-  Drag racing gameplay mechanics.​  

-  Real-Time telemetry data (speedometer, tachometer, shift indicator)

-  Pixel-art graphics and animations.   

-  Garage page where there are different cars to choose from and purchase using in-game currency. Can also pick different paint and wheel options to personalise it to your liking. 

-  Individual car upgrade system to increase acceleration rates to get faster race times.

-  Progression system (XP & cash to spend on aforementioned upgrades)

-   Interactive controls and game state management.

-   AI opponent functionality with difficulties to choose from. Higher difficulties result in better rewards.

-  Day/Night races

-   Score tracking and result display at the end of each race (race result, race time, shift accuracy, top speed reached)

- Nitrous boost minigame (user has to beat the mini game in order to gain the nitrous speed boost)

- Nitrous tuning (can adjust duration and power of nitrous speedboost)

- In-game race soundtrack with randomised songs that play when a race starts

- In-game settings page to adjust overall game volume and direct mute buttons to mute the game entirely.

- Dynamic wind particle effects that increase in intensity as the player car goes faster and faster. Further particle effects applied when nitrous is in use. 

- Stats page where the user can view their best stats (fastest time, top speed etc)

- Log in/sign up pages where the user can create an account to save their game data to their browser's local storage. 
    

## Getting Started

### Prerequisites
- Must have Node.js installed (https://nodejs.org/en)

- Visual Studio Code (https://code.visualstudio.com/Download)

	- Install the Live server extension by Ritwick Dey from the extensions marketplace   	within Visual Studio Code
	
- Any modern browser (Chrome, Firefox, Safari, Brave etc)


### Installation and Launch Steps

1.  **Download the Game Files**:
    -   Go to the GitHub repo main page.
    
    -   Click the green "<> Code" button.
    
    -   Select "Download ZIP".
    
    -   Extract the ZIP file to a folder on your computer (e.g., Desktop/PixelDragRacing).
    
    
2.  **Set Up Dependencies**:
    -   Open the extracted folder in Visual Studio Code (File > Open Folder).
    
    -   Open the integrated terminal in VS Code (Terminal > New Terminal). Make sure you're in the project root (where  package.json is).
    
    -   Run this command to install Phaser and other tools:
        
        ```
        npm install
        ```
        
        This might take a minute or so as it is installing the game engine libraries
       
3.  **Launch the Game**:
    -   In VS Code, right-click "index.html" in the file explorer.
    
    -   Choose "Open with Live Server".
    
    -   Your default browser will open to  http://127.0.0.1:5500  (or similar). Wait a few seconds for assets to load. This loading time will depend on your machine. 
    
    -   If it doesn't load, refresh the page or check the VS Code terminal for errors.
    
4.  **First-Time Play Tips**:
    -   On load, you'll see the main menu with your cash balance at the top left and a profile button on the top right where you can choose to sign up to save your data locally in your browser's cache. You will also see an info page that, when clicked into, will have details about the controls of the game. You will also see 3 buttons in the centre: settings, play and garage. 
    
    - The Settings page has options to adjust the game's master volume or mute the game entirely.
    
    -   You can click into the to the garage to view your cars and others that you may want to purchase in the future. Here, you can also upgrade your owned cars using cash earned through playing races. Furthermore, you can tune the nitrous speed boost so that you can decide whether you want it to last longer or be more powerful but be warned, increasing one stat, like the power, will have an inverse affect on the duration and vice versa. Longer nitrous duration may be more helpful for longer tracks and a higher nitrous power may be better for shorter tracks so tune accordingly and play around!
    
    -   Start a race: Pick a difficulty, day/night track, and go! Begin accelerating as soon as you see "GO!" to get a short speed boost and shift at the right RPM (watch the tachometer and shift indicator light at the centre of the two guages) for perfect shifts (If a perfect shift is executed by shifting between 8250 and 8750 RPM, you will get a short burst of speed, so timing these is essential against higher level opponents). Refer to the controls section below to view the main controls of the game when in a race.
    
    - Post Race Scene: After you cross the finish line (or if you do not finish (DNF)), you will be met with a race summary that will display the race result, your time, the opponent's time, your top speed reached and your perfect shift percentage (how many perfect shifts done throughout the race). You will also see how much cash and XP you earned for completing that race.

## Controls

-   **Acceleration**: Up Arrow Key (hold to accelerate).

-   **Shift Up**: E Key (shifts to higher gear; time near redline for perfect shifts).

-   **Shift Down**: Q Key (shifts to lower gear; useful for strategy but risks over-revving and can slow you down).

-   **Nitrous Boost**: Spacebar (starts a nitrous mini game where you have to press spacebar once the indicator is in the green area. If you succeed, you gain the speed boost, if you fail, you must wait for the nitrous countdown to end before trying again).

-   **Menu Navigation**: Mouse clicks on buttons (e.g., start, settings, garage).

All controls are keyboard-based for racing, with mouse support for menus.

## Technologies Used

-   **Phaser 3**: Game framework for physics, audio, and rendering.

-   **JavaScript/ES6**: Core logic.

-   **HTML5/CSS3**: Structure and styling.

-   **LocalStorage**: For saving player data.

## Troubleshooting

-   **Load Issues**: Slow PC/Laptop? Close other browser tabs and applications that are currently running on your machine and retry. 

-   **Missing Save?**: Ensure that you are using same browser and device. Saves cannot be transferred to other devices or browsers so if for example you create an account while running the game on Google Chrome, you cannot log in with the same account in a different browser like Firefox or log in on a different machine. LocalStorage is on a per browser basis and you data is saved directly in the browser's cache. 
- **Want to delete a save?**: Simply, clear your browser's cache to reset your stats. 