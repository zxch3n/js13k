import { Planet } from './planet/planet';
import { LocalPosition, Position, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
import { CameraTarget } from './type';

const ALPHA = 0.1;

export class Human implements CameraTarget {
  speedY: number = 0;
  sprite: Sprite = new Sprite((ctx) => {
    /**
     * FIXME: 目前没对应到脚站的地方
     */
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.rotate(xToRadian(this.localPos.x));
    ctx.fillRect(-1, -2, 1, 2);
    ctx.restore();
    this.update();
  });

  planet: Planet;
  constructor(planet: Planet) {
    this.planet = planet;
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
    const localPos = this.localPos;
    this.localPos = { x: localPos.x + x, y: localPos.y + y };
    if (this.onGround) {
      this.speedY = 0;
    }
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
    this.lastUpdated = +new Date();
    this.move(0, this.speedY);
  }
}
