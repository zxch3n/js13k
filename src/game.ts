import { addControl, Human } from './human';
import { getPlanetMaterial } from './material';
import { Planet } from './planet/planet';
import { TILE_DIRT } from './planet/tiles';
import { Stage } from './stage';
import ZombieSpawn from './zombie';

export class Game {
  end: boolean = false;
  canvas: HTMLCanvasElement;
  stage: Stage;
  zombieSpawn: ZombieSpawn;
  human: Human;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const stage = new Stage(canvas);
    this.stage = stage;
    const planet = new Planet({ x: 0, y: 0 }, 50);
    planet.tiles.setTile(0, 50, { type: TILE_DIRT });
    planet.tiles.random();
    const human = new Human(planet);
    const zombieSpawn = new ZombieSpawn(human, planet);
    this.zombieSpawn = zombieSpawn;
    stage.camera.focus(human);
    stage.addChild(planet);
    this.human = human;
    getPlanetMaterial().then(() => {
      requestAnimationFrame(() => {
        stage.draw();
      });
    });
  }

  start() {
    const stage = this.stage;
    addControl(this.human);
    this.stage.camera.scale = 22;
    requestAnimationFrame(function draw() {
      stage.draw();
      requestAnimationFrame(draw);
    });
    // requestAnimationFrame(function scale() {
    //   stage.camera.scale += 0.07;
    //   if (stage.camera.scale >= 30) {
    //     return;
    //   }
    //   requestAnimationFrame(scale);
    // });
  }

  restart() {}
}
