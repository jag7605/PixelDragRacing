export default class TutorialCoach {
  constructor(scene, playerCar) {
    this.scene = scene;
    this.player = playerCar;

    //semi-transparent blocker so clicks don’t hit the world during prompts
    this.blocker = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.25)
      .setScrollFactor(0).setDepth(10).setInteractive();

    this.tooltip = this.makeTooltip();
    this.arrow = this.makeArrow();

    //step machine
    this.stepIndex = 0;
    this.steps = [
      {
        id: 'intro',
        text: 'Hold ▲ (UP) when the countdown reaches GO to launch!',
        place: () => this.at(640, 240),                    // center
        start: () => {},                                   // nothing
        done: () => this.scene.raceStarted && this.player.isAccelerating
      },
      {
        id: 'perfectStart',
        text: 'Great! Keep revs in the sweet spot before GO for a Perfect Start.',
        place: () => this.at(530, 520).pointAt(530, 620),  // above RPM dial
        start: () => {},
        done: () => this.scene.raceStarted && this.player.distance > 5
      },
      {
        id: 'shiftUp',
        text: 'Shift Up with "E" near the red line for maximum speed!',
        place: () => this.at(530, 520).pointAt(530, 620),
        start: () => {},
        done: () => this.player.gearSystem.currentGear >= 2
      },
      {
        id: 'nitrous',
        text: 'Hit SPACE to use Nitrous when straight and steady!',
        place: () => this.at(730, 520).pointAt(750, 620),
        start: () => {},
        done: () => this.player.nitrousActive || this.player.nitrousCooldown > 0
      },
      {
        id: 'finish',
        text: 'Nice work! Race to the finish line to complete the tutorial.',
        place: () => this.at(900, 200),   
        start: () => { this.scene.finishLine?.setVisible(true); },
        done: () => !!this.player.finishTime
      },
      {
        id: 'outro',
        text: 'Tutorial complete! You can replay it anytime from the Menu.',
        place: () => this.at(640, 240),
        start: () => {},
        done: () => true
      }
    ];

    this.enterStep(0);
  }

  //UI bits
  makeTooltip() {
    const bg = this.scene.add.rectangle(0, 0, 560, 90, 0x111111, 0.95)
      .setScrollFactor(0).setDepth(11).setOrigin(0.5).setStrokeStyle(2, 0xffffff);
    const txt = this.scene.add.text(0, 0, '', {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', align: 'center', wordWrap: { width: 520 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12);
    const container = this.scene.add.container(640, 240, [bg, txt]).setDepth(12);
    container.setScrollFactor(0);
    container.txt = txt; container.bg = bg;
    return container;
  }

  makeArrow() {
    //a simple arrow that we can place to point at a UI element
    const g = this.scene.add.graphics().setDepth(12).setScrollFactor(0);
    g.lineStyle(4, 0xffffff, 1);
    g.fillStyle(0xffffff, 1);
    //triangle head (pointing down by default)
    const tri = new Phaser.Geom.Triangle(0, 0, -10, -20, 10, -20);
    g.strokeTriangleShape(tri); g.fillTriangleShape(tri);
    g.x = 640; g.y = 260;
    g.visible = false;
    return g;
  }

  at(x, y) {
    this.tooltip.x = x; this.tooltip.y = y;
    this.arrow.visible = false;
    return this;
  }

  pointAt(x, y) {
    this.arrow.visible = true;
    this.arrow.x = x; this.arrow.y = y - 30; //a little above the target
    return this;
  }

  //step control
  enterStep(i) {
    this.stepIndex = i;
    const s = this.steps[i];
    if (!s) return;
    s.place?.();
    this.tooltip.txt.setText(s.text);
    s.start?.();
  }

  next() {
    const i = this.stepIndex + 1;
    if (i < this.steps.length) {
      this.enterStep(i);
    } else {
      //let the race finish naturally (tutorial is done)
      this.destroy();
    }
  }

  update() {
    const s = this.steps[this.stepIndex];
    if (!s) return;
    if (s.done?.()) this.next();
  }

  destroy() {
    this.blocker?.destroy();
    this.arrow?.destroy();
    this.tooltip?.destroy();
  }
}