import { Planet } from './planet/planet';
import { LocalPosition, Position, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget } from './type';

const ALPHA = 0.1;

export class Human implements CameraTarget {
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
    this.localPos = { x: 0, y: this.planet.r };
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
    this.localPos = { x: localPos.x + x, y: localPos.y + y };
    if (this.onGround) {
      this.speedY = 0;
    }
  }

  speedUp(x: number) {
    this.speedX = clamp(this.speedX + x, -0.5, 0.5);
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

  private lastUpdated = 0;

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
