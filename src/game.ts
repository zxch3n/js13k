import { addControl, Human } from './human';
import { getPlanetMaterial } from './material';
import { Planet, planetChildDraw } from './planet/planet';
import { TILE_DIRT } from './planet/tiles';
import { Stage } from './stage';
import ZombieSpawn from './zombie';

export class Game {
  end: boolean = false;
  canvas: HTMLCanvasElement;
  stage: Stage;
  zombieSpawn: ZombieSpawn;
  human: Human;
  score = 0;
  planet: Planet;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const stage = new Stage(canvas);
    this.stage = stage;
    const planet = new Planet({ x: 0, y: 0 }, 50);
    this.planet = planet;
    planet.tiles.setTile(0, 50, { type: TILE_DIRT });
    planet.tiles.random();
    const human = new Human(planet);
    const zombieSpawn = new ZombieSpawn(human, planet);
    this.zombieSpawn = zombieSpawn;
    zombieSpawn.addZombieDieListener(() => {
      this.score += 10;
      console.log(this.score);
    });
    stage.camera.focus(human);
    stage.addChild(planet);
    this.human = human;
    getPlanetMaterial().then(() => {
      requestAnimationFrame(() => {
        stage.draw();
      });
    });
  }

  drawUI() {
    const ctx = this.canvas.getContext('2d')!;
    ctx.resetTransform();
    ctx.fillStyle = '#fff';
    ctx.font = '16px serif';
    ctx.fillText(`Score: ${this.score}`, 12, 20);
  }

  start() {
    this.score = 0;
    const stage = this.stage;
    const drawUI = this.drawUI.bind(this);
    // const planet = this.planet;
    addControl(this.human);
    this.stage.camera.scale = 30;
    requestAnimationFrame(function draw() {
      stage.draw();
      drawUI();
      requestAnimationFrame(draw);
    });
    // requestAnimationFrame(function scale() {
    //   stage.camera.scale += 0.07;
    //   if (stage.camera.scale > 16) {
    //     planet.cache.clearCache();
    //   }

    //   if (stage.camera.scale >= 30) {
    //     return;
    //   }
    //   requestAnimationFrame(scale);
    // });
  }

  restart() {}
}
