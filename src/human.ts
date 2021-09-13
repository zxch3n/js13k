import Bullet from './Bullet';
import GameObject, { absMax, getDirection, Life } from './gameObject';
import { Gun } from './gun';
import { HumanMaterial } from './material';
import { Planet } from './planet/planet';
import {
  getDrawPos,
  LocalPosition,
  PIXEL_TO_GLOBAL_COORDINATE,
  Position,
  TILE_NUM,
  toGlobal,
  xToRadian,
} from './position';
import { Sprite } from './sprite';
import { CameraTarget, LightSource } from './type';

const ALPHA = 0.1;
const MAX_MOVE_SPEED = 0.2;

export class Human
  extends GameObject
  implements CameraTarget, LightSource, Life
{
  faceLeft = false;
  maxHp: number = 100;
  curHp: number = 100;
  speedY: number = 0;
  speedX: number = 0;
  pressState: 'left' | 'right' | 'none' = 'none';
  private diggingState: number = 0;
  isDigging = false;
  sprite: Sprite;
  bullets: Bullet[] = [];
  gun = new Gun(this);

  planet: Planet;
  constructor(planet: Planet) {
    super(planet);
    this.planet = planet;
    this.sprite = this.buildSprite(HumanMaterial);
    planet.addChild(this.sprite);
    planet.addLightSource(this);
    this.localPos = { x: 0, y: this.planet.r + 1 };
  }

  getLightPos(): LocalPosition {
    return this.localPos;
  }

  getLightRadius(): number {
    return 10;
  }

  async setMaterial(material: Promise<HTMLCanvasElement>) {
    this.sprite.material = await material;
  }

  getCameraZoom(): number {
    return this.planet.r / this.localPos.y;
  }

  getCameraPos(): Position {
    return this.sprite.getStagePos();
  }

  getCameraRotation(): number {
    return xToRadian(this.localPos.x);
  }

  move(x: number, y: number) {
    const localPos = this.localPos;
    let tried = 0;
    let nextX = localPos.x + x;
    let nextY = localPos.y + y;
    while (this.planet.hasTile(nextX, nextY)) {
      this.speedX = 0;
      x = absMax(x - getDirection(x) / 10, x / 2);
      y = absMax(y - getDirection(y) / 10, y / 2);
      nextX = localPos.x + x;
      nextY = localPos.y + y;
      if (tried++ > 100) {
        console.error('MAX TRIED');
        return;
      }
    }

    const pos = { x: nextX % TILE_NUM, y: nextY };
    if (y < 0 && this.getOnGround(pos)) {
      pos.y = Math.round(pos.y);
      this.speedY = 0;
    }

    this.localPos = pos;
  }

  speedUp(x: number) {
    this.speedX = clamp(this.speedX + x, -MAX_MOVE_SPEED, MAX_MOVE_SPEED);
  }

  jump() {
    if (this.speedY !== 0) {
      return;
    }

    this.speedY = 0.4;
  }

  /**
   * refresh every frame
   * @param elapsed
   */
  update(elapsed: number = (+new Date() - this.lastUpdated) / 60) {
    this.updatePosOnPressState();
    if (this.speedY > -4 && !this.getOnGround()) {
      this.speedY = Math.max(this.speedY - ALPHA * elapsed, -4);
    }

    if (this.getOnGround()) {
      this.speedX = this.speedX * 0.9;
    }

    this.dig(elapsed);
    this.lastUpdated = +new Date();
    this.move(this.speedX, this.speedY);
  }

  private dig(elapsed: number) {
    if (!this.isDigging) {
      return;
    }

    if (!this.getOnGround()) {
      this.diggingState = 0;
      return;
    }

    this.diggingState += elapsed;
    if (this.diggingState >= 1) {
      console.log('dig');
      this.diggingState = 0;
      this.planet.removeTile(Math.round(this.localPos.x), this.localPos.y - 1);
    }
  }

  private updatePosOnPressState() {
    if (this.pressState === 'left') {
      this.faceLeft = true;
      this.speedUp(-0.03);
    }
    if (this.pressState === 'right') {
      this.faceLeft = false;
      this.speedUp(0.03);
    }
  }
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function addControl(human: Human) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      human.pressState = 'left';
    }
    if (e.key === 'ArrowRight') {
      human.pressState = 'right';
    }
    if (e.key === 'ArrowDown') {
      human.isDigging = true;
    }

    e.key === 'ArrowUp' && human.jump();
    if (e.key === 'c') {
      human.gun.fire();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      human.pressState = 'none';
    }
    if (e.key === 'ArrowDown') {
      human.isDigging = false;
    }
  });
}
