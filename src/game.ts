import { addControl, Human } from './human';
import { getPlanetMaterial } from './material';
import { Planet } from './planet/planet';
import { TILE_DIRT } from './planet/tiles';
import { Spaceship } from './spaceship';
import { Stage } from './stage';
import ZombieSpawn from './zombie';

let bestScore = parseInt(localStorage.getItem('bestScore') || '0');

export class Game {
  end: boolean = false;
  win = false;
  canvas: HTMLCanvasElement;
  stage: Stage;
  zombieSpawn: ZombieSpawn;
  human: Human;
  score = 0;
  planet: Planet;
  spaceship: Spaceship;

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
    this.spaceship = new Spaceship(planet, human);
    const zombieSpawn = new ZombieSpawn(human, planet);
    this.zombieSpawn = zombieSpawn;
    zombieSpawn.addZombieDieListener(() => {
      this.score += 10;
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
      bestScore = parseInt(localStorage.getItem('bestScore') || '0');
      if (this.score > bestScore) {
        localStorage.setItem('bestScore', this.score.toString());
      }
    });
    this.spaceship.addListener('found', () => {
      this.foundSpaceship();
    });

    document.addEventListener('keydown', this.keydown);
  }

  foundSpaceship() {
    this.score += 1000;
    this.stage.camera.focus(this.spaceship);
    this.human.destroy();
    setTimeout(() => {
      this.spaceship.speedY = Math.min(this.spaceship.speedY + 0.1, 1);
      const scale = () => {
        this.stage.camera.scale *= 0.99;
        if (this.stage.camera.scale < 1) {
          this.win = true;
          return;
        }

        requestAnimationFrame(scale);
      };

      scale();
    }, 4000);

    bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    if (this.score > bestScore) {
      localStorage.setItem('bestScore', this.score.toString());
    }
  }

  keydown = () => {
    if (this.end || this.win) {
      this.restart();
    }
  };

  drawUI() {
    const ctx = this.canvas.getContext('2d')!;
    ctx.resetTransform();
    if (this.win) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '30px serif';
      ctx.fillText(
        'You Win!',
        this.canvas.width / 2 - 100,
        this.canvas.height / 2 - 150,
      );
      ctx.fillText(
        `Score: ${this.score}`,
        this.canvas.width / 2 - 100,
        this.canvas.height / 2 - 120,
      );
      ctx.font = '20px serif';
      ctx.fillText(
        `Press Any Key To Restart`,
        this.canvas.width / 2 - 100,
        this.canvas.height / 2 - 90,
      );
      return;
    }

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
      ctx.fillText(`Best Score: ${bestScore}`, 12, 40);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(
        `Move ↑←→     Dig ↓     Pile Space      Attack c`,
        this.canvas.width - 320,
        this.canvas.height - 20,
      );
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
    this.win = false;
    this.stage.children.length = 0;
    this.stage.camera.scale = 30;
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
    this.spaceship = new Spaceship(planet, human);
    zombieSpawn.addZombieDieListener(() => {
      this.score += 10;
    });
    stage.camera.focus(human);
    stage.addChild(planet);
    this.human = human;
    this.gc.push(addControl(this.human));
    this.human.addListener('die', () => {
      this.end = true;
    });
    this.spaceship.addListener('found', () => {
      this.foundSpaceship();
    });
  }
}
