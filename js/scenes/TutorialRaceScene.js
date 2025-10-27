import RaceScene from './RaceScene.js';
import TutorialCoach from '../gameplay/TutorialCoach.js';

export default class TutorialRaceScene extends RaceScene {
  constructor() {
    super('TutorialRaceScene'); 
  }

  create() {
    //normal race setup
    super.create();

    //tutorial tuning
    this.registry.set('tutorialMode', true);
    this.trackLength = 1800;                // shorter track
    this.finishLineX = this.trackLength - 200;
    this.finishLine?.setVisible(false);

    //keep bot out of the way
    if (this.botCar) {
      this.botCar.aiDisabled = true;       
      this.botCar.speed = 0;
    }

    // coach overlay last (above HUD)
    this.coach = new TutorialCoach(this, this.playerCar);
  }

  update(time, delta) {
    //run normal update
    super.update(time, delta);

    //coach needs a tick even if race hasn't started yet (e.g., during countdown)
    this.coach?.update();
  }

  raceOver() {
    //stop coach first so it doesn’t keep prompting
    this.coach?.destroy();
    this.coach = null;

    //tutorial complete (don’t auto-show again)
    try {
      const key = 'tutorialProgress_v1';
      const cur = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...cur, seen: true }));
    } catch {}

    super.raceOver();
  }
}