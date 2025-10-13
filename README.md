# PixelDragRacing

PixelDragRacing is a web-based drag racing game that focuses on fast-paced pixel-art racing experiences. This repository contains all the source code required to run and modify the game.​

## Features

-  Drag racing gameplay mechanics.​  
-  Real-Time telemetry data (speedometer, tachometer, shift indicator)
-  Pixel-art graphics and animations.   
-  Garage page where there are different cars to choose from and purchase using in-game currency. Can also pick different paint and wheel options. 
-  Individual car upgrade system to increase acceleration rates to get faster race times.
-  Progression system (XP & cash to spend on aforementioned upgrades)
-   Interactive controls and game state management.
-   AI opponent functionality with difficulties to choose from. Higher difficulties result in better rewards.
-  Day/Night races
-   Score tracking and result display at the end of each race (race result, race time, shift accuracy, top speed reached)
- Nitrous boost minigame (user has to beat the mini game in order to gain the nitrous speed boost)
- Nitrous tuning (can adjust duration and power of nitrous speedboost)
- In-game race soundtrack with randomised songs that play when a race starts
- In-game setting page to adjust overall game volume or muting the game entirely by clicking the mute icon
- Dynamic wind particle effects that increase in intensity as the player car goes faster and faster. Further particle effects applied when nitrous is in use. 
- Stats page where the user can view their best stats (fastest time, top speed etc)
- Log in/sign up pages where the user can create an account to save their game data to their browser's local storage
    

## Getting Started

### Prerequisites
- Must have Node.js installed (https://nodejs.org/en)
- Visual Studio Code (https://code.visualstudio.com/Download)
		- Install the Live server extension by Ritwick Dey from the extensions marketplace   	within Visual Studio Code
- Any browser (Chrome, Firefox, Safari, Brave etc)

### Installation

- Download the project from the main page of the GitHub repository by clicking the green "<> Code" button then click the "Download ZIP" button. 
- Extract the folder
- Open the project in Visual Studio Code
- Open the terminal in Visual Studio Code and run the following command to install the game engine tools (ensure you're in the correct project folder):
```bash
npm install
```
- Once installed, right-click on the "index.html" file and click "Open with Live Server"
- The game will launch in your computer's default browser, it may take some time to launch depending on your machine as the game will be loading assets. 

You can now play PixelDragRacing. 




