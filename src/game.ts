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
  score = 0;
  planet: Planet;

  gc: (() => void)[] = [];
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
    this.gc.push(addControl(this.human));
    this.human.addListener('die', () => {
      this.end = true;
    });

    document.addEventListener('keydown', this.keydown);
  }

  keydown = () => {
    if (this.end) {
      this.restart();
    }
  };

  drawUI() {
    const ctx = this.canvas.getContext('2d')!;
    ctx.resetTransform();
    if (this.end) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '30px serif';
      ctx.fillText(
        'Game Over',
        this.canvas.width / 2 - 100,
        this.canvas.height / 2,
      );
      ctx.fillText(
        `Score: ${this.score}`,
        this.canvas.width / 2 - 100,
        this.canvas.height / 2 + 30,
      );
      ctx.font = '20px serif';
      ctx.fillText(
        `Press Any Key To Restart`,
        this.canvas.width / 2 - 100,
        this.canvas.height / 2 + 60,
      );
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = '16px serif';
      ctx.fillText(`Score: ${this.score}`, 12, 20);
    }
  }

  start() {
    this.score = 0;
    const stage = this.stage;
    const drawUI = this.drawUI.bind(this);
    // const planet = this.planet;
    this.stage.camera.scale = 30;
    requestAnimationFrame(function draw() {
      stage.draw();
      drawUI();
      requestAnimationFrame(draw);
    });
  }

  restart() {
    this.score = 0;
    this.end = false;
    this.stage.children.length = 0;
    this.gc.forEach((x) => x());
    this.gc = [];

    const stage = this.stage;
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
    this.gc.push(addControl(this.human));
    this.human.addListener('die', () => {
      this.end = true;
    });
  }
}
