import Bullet from './Bullet';
import GameObject, { Life } from './gameObject';
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
    const sprite = this.sprite;
    this.sprite.draw = (ctx) => {
      this.update();
      if (sprite.material) {
        if (sprite.width * sprite.height === 0) {
          sprite.width = sprite.material.width / PIXEL_TO_GLOBAL_COORDINATE;
          sprite.height = sprite.material.height / PIXEL_TO_GLOBAL_COORDINATE;
        }
      }
      ctx.save();
      {
        ctx.translate(0, 1); // TODO: why?
        const radius = xToRadian(this.planetPos.x);
        ctx.rotate(radius);
        const translate = getDrawPos(this.planetPos.y, this.planet.r);
        ctx.translate(0, -translate);
        ctx.rotate(-radius);
        ctx.scale(sprite.scale, sprite.scale);
        ctx.translate(0, -sprite.height);
        sprite._draw && sprite._draw(ctx);
        sprite.children.forEach((x) => x.draw(ctx));
      }
      ctx.restore();
    };
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

  /**
   * 对应脚站的地方
   */
  private planetPos: LocalPosition = { x: 0, y: 0 };
  get localPos() {
    return this.planetPos;
  }

  set localPos(pos: LocalPosition) {
    this.planetPos = pos;
    this.sprite.pos = toGlobal({
      x: pos.x,
      y: getDrawPos(pos.y, this.planet.r) - 1,
    });
  }

  getOnGround(pos = this.localPos) {
    return this.planet.hasTile(pos.x, pos.y - 1);
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

function getDirection(x: number) {
  if (Math.abs(x) < 0.0001) return 0;
  return x < 0 ? -1 : 1;
}

function absMax(a: number, b: number) {
  if (Math.abs(a) > Math.abs(b)) {
    return a;
  }

  return b;
}
