import { Planet } from './planet/planet';
import { LocalPosition, Position, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget } from './type';
import GameObject, { ObjectPool } from './gameObject';
import Bullet from './Bullet';

const ALPHA = 0.1;

export class Human extends GameObject implements CameraTarget {
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
  gun: ObjectPool<Bullet> = new ObjectPool(([pos, speed, faceLeft]) => {
    return new Bullet(pos, speed, faceLeft);
  });

  planet: Planet;
  constructor(planet: Planet) {
    super();
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

  fire() {
    let bullet = this.gun.instantiate(
      Bullet.reload(this.localPos, 5, this.faceLeft),
      this.localPos,
      5,
      this.faceLeft,
    ) as Bullet;
    this.planet.addChild(bullet.sprite);
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
      human.move(-0.5, 0);
      human.speedUp(-0.2);
    }
    if (e.key === 'ArrowRight') {
      human.move(0.5, 0);
      human.speedUp(0.2);
    }
    e.key === 'ArrowUp' && human.jump();
    if (e.key === 'Control') {
      human.fire();
    }
  });
}
