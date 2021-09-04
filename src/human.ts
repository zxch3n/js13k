import { range } from './atmosphere/range';
import { Planet } from './planet/planet';
import { LocalPosition, Position, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget, LightSource } from './type';

const ALPHA = 0.1;

export class Human implements CameraTarget, LightSource {
  faceLeft = false;
  speedY: number = 0;
  speedX: number = 0;
  sprite: Sprite = new Sprite((ctx) => {
    /**
     * FIXME: 目前没对应到脚站的地方
     */
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.rotate(xToRadian(this.localPos.x));
    const material = this.sprite.material;
    if (material) {
      if (this.faceLeft) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        material,
        -this.sprite.width / 2,
        -this.sprite.height / 2,
        this.sprite.width,
        this.sprite.height,
      );
    } else {
      ctx.fillRect(-1, -2, 1, 2);
    }
    ctx.restore();
    this.update();
  });

  planet: Planet;
  constructor(planet: Planet) {
    this.planet = planet;
    planet.addChild(this.sprite);
    planet.addLightSource(this);
    this.localPos = { x: 0, y: this.planet.r };
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

  getCameraPos(): Position {
    return this.sprite.getStagePos();
  }

  getCameraRotation(): number {
    return xToRadian(this.localPos.x);
  }

  move(x: number, y: number) {
    this.faceLeft = x < 0;
    const localPos = this.localPos;
    let nextX = localPos.x + x;
    let nextY = localPos.y + y;
    if (this.planet.hasTile(nextX, nextY + 1)) {
      this.speedX = -0;
    }

    if (this.planet.hasTile(localPos.x + getDirection(x) / 2, nextY + 1)) {
      nextX = localPos.x;
      this.speedX = 0;
    }

    if (y < 0) {
      for (let y of range(Math.round(localPos.y), Math.round(nextY))) {
        if (this.getOnGround({ x: nextX, y })) {
          nextY = y;
          break;
        }
      }
    }

    this.localPos = { x: nextX, y: nextY };
  }

  speedUp(x: number) {
    this.speedX = clamp(this.speedX + x, -0.3, 0.3);
  }

  /**
   * 对应脚站的地方
   */
  get localPos() {
    return this.sprite.localPos();
  }

  set localPos(pos: LocalPosition) {
    this.sprite.pos = toGlobal(pos);
  }

  getOnGround(pos = this.localPos) {
    const distance = this.planet.getDistanceToSurface(pos.x, pos.y);
    return distance < 0.0001;
  }

  jump() {
    if (this.speedY !== 0) {
      return;
    }

    this.speedY = 0.4;
  }

  private lastUpdated = 0;

  /**
   * refresh every frame
   * @param elapsed
   */
  update(elapsed: number = (+new Date() - this.lastUpdated) / 60) {
    if (this.speedY > -4 && !this.getOnGround()) {
      this.speedY = Math.max(this.speedY - ALPHA * elapsed, -4);
    }

    if (this.getOnGround()) {
      this.speedX = this.speedX * 0.9;
      if (this.speedY < 0) {
        this.speedY = 0;
      }
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
      human.move(-0.5, 0);
      human.speedUp(-0.2);
    }
    if (e.key === 'ArrowRight') {
      human.move(0.5, 0);
      human.speedUp(0.2);
    }
    e.key === 'ArrowUp' && human.jump();
  });
}

function getDirection(x: number) {
  if (Math.abs(x) < 0.0001) return 0;
  return x < 0 ? -1 : 1;
}
