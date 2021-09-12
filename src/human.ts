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
  pressState: 'left' | 'right' | 'none' = 'none';
  sprite: Sprite = new Sprite((ctx) => {
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.rotate(xToRadian(this.localPos.x));
    const material = this.sprite.material;
    if (material) {
      if (this.faceLeft) {
        ctx.scale(-1, 1);
      }
      const scale = this.localPos.y / this.planet.r;
      ctx.translate(0, this.sprite.height + this.sprite.height / 12);
      ctx.scale(scale, scale);
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
    this.localPos = { x: 0, y: this.planet.r + 10 };
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

    const pos = { x: nextX, y: nextY };
    if (y < 0 && this.getOnGround(pos)) {
      pos.y = Math.round(pos.y);
      this.speedY = 0;
    }

    this.localPos = pos;
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
    return this.planet.hasTile(pos.x, pos.y - 1);
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
    this.updatePosOnPressState();
    if (this.speedY > -4 && !this.getOnGround()) {
      this.speedY = Math.max(this.speedY - ALPHA * elapsed, -4);
    }

    if (this.getOnGround()) {
      this.speedX = this.speedX * 0.9;
    }

    this.lastUpdated = +new Date();
    this.move(this.speedX, this.speedY);
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
    e.key === 'ArrowUp' && human.jump();
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      human.pressState = 'none';
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
