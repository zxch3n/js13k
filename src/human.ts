import Bullet from './Bullet';
import GameObject, { getDirection, Life } from './gameObject';
import { Gun } from './gun';
import { HumanMaterial } from './material';
import { Planet } from './planet/planet';
import { LocalPosition, Position, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget, LightSource } from './type';

const MAX_MOVE_SPEED = 0.2;

export class Human
  extends GameObject
  implements CameraTarget, LightSource, Life
{
  faceLeft = false;
  maxHp: number = 100;
  curHp: number = 100;
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

  speedUp(x: number) {
    this.speedX = clamp(this.speedX + x, -MAX_MOVE_SPEED, MAX_MOVE_SPEED);
  }

  jump() {
    if (this.speedY !== 0) {
      return;
    }

    this.speedY = 0.4;
  }

  pile() {
    if (this.getOnGround()) {
      this.planet.addTile(Math.round(this.localPos.x), this.localPos.y);
      this.move(0, 1);
      this.speedY = 0.1;
    }
  }

  /**
   * refresh every frame
   * @param elapsed
   */
  update(elapsed: number = (+new Date() - this.lastUpdated) / 60) {
    this.updatePosOnPressState();
    this.gravity(elapsed);

    this.dig(elapsed);
    this.lastUpdated = +new Date();
    this.move(this.speedX, this.speedY, true);
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
      this.diggingState = 0;
      this.planet.removeTile(Math.round(this.localPos.x), this.localPos.y - 1);
    }
  }

  private updatePosOnPressState() {
    if (this.pressState === 'left') {
      this.faceLeft = true;
      this.speedUp(-0.01);
      this.move(-0.1, 0);
    }
    if (this.pressState === 'right') {
      this.faceLeft = false;
      this.speedUp(0.01);
      this.move(0.1, 0);
    }
  }

  hurt(damage: number, from: LocalPosition) {
    this.curHp = Math.max(0, this.curHp - damage);
    const d = getDirection(this.localPos.x - from.x);
    this.speedX += d * 0.2;
    if (this.curHp === 0) {
      this.emit({ eventName: 'die' });
    }
  }
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function addControl(human: Human) {
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      human.pressState = 'left';
    }

    if (e.key === 'ArrowRight') {
      human.pressState = 'right';
    }

    if (e.key === 'ArrowDown') {
      human.isDigging = true;
    }

    if (e.key === ' ') {
      human.pile();
    }

    e.key === 'ArrowUp' && human.jump();
    if (e.key === 'c') {
      human.gun.fire();
    }
  };
  const onKeyup = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      human.pressState = 'none';
    }
    if (e.key === 'ArrowDown') {
      human.isDigging = false;
    }
  };
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyup);
  return () => {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('keyup', onKeydown);
  };
}
