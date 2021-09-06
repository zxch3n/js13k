import { Planet } from './planet/planet';
import { LocalPosition, Position, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget } from './type';
import GameObject, { GEvent, Life, ObjectPool } from './gameObject';
import Bullet from './Bullet';
import { Gun } from './gun';
import { HumanMaterial, ZombieMaterial } from './material';

const ALPHA = 0.1;
const MAX_MOVE_SPEED = 0.2;

export class Human extends GameObject implements CameraTarget, Life {
  faceLeft = false;
  maxHp: number = 100;
  curHp: number = 100;
  speedY: number = 0;
  speedX: number = 0;
  bullets: Bullet[] = [];
  sprite: Sprite;
  gun = new Gun(this);

  planet: Planet;
  constructor(planet: Planet) {
    super();
    this.planet = planet;
    this.sprite = this.buildSprite(HumanMaterial);
    planet.addChild(this.sprite);
    this.localPos = { x: 0, y: this.planet.r };
  }

  getCameraPos(): Position {
    return this.sprite.getStagePos();
  }

  getCameraRotation(): number {
    return xToRadian(this.localPos.x);
  }

  move(x: number, y: number) {
    this.faceLeft = x < 0;
    const localPos = this.localPos;
    this.localPos = { x: localPos.x + x, y: localPos.y + y };
    if (this.onGround) {
      this.speedY = 0;
    }
  }

  speedUp(x: number) {
    this.speedX = clamp(this.speedX + x, -MAX_MOVE_SPEED, MAX_MOVE_SPEED);
  }

  /**
   * 对应脚站的地方
   */

  // TODO: use collision detection
  get onGround() {
    return this.localPos.y <= this.planet.r;
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
    if (this.speedY > -4 && !this.onGround) {
      this.speedY -= ALPHA * elapsed;
    }

    if (this.onGround) {
      this.speedX = this.speedX * 0.9;
    } else {
      this.speedX = this.speedX * 0.99;
    }

    this.lastUpdated = +new Date();
    this.move(this.speedX, this.speedY);
  }


}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function addControl(human: Human) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      human.move(-0.3, 0);
      human.speedUp(-0.2);
    }
    if (e.key === 'ArrowRight') {
      human.move(0.3, 0);
      human.speedUp(0.2);
    }
    e.key === 'ArrowUp' && human.jump();
    if (e.key === 'c') {
      human.gun.fire();
    }
  });
}
