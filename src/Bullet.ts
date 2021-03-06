import { Sprite } from './sprite';
import { Position, xToRadian, toGlobal } from './position';
import GameObject, { GEvent, Life } from './gameObject';
import { Zombie } from './zombie';
import { Planet } from './planet/planet';

export default class Bullet extends GameObject {
  damage = 20;
  maxFlyDistance = 50;
  speed = 2;
  sprite: Sprite = new Sprite((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = 'orange';
    ctx.rotate(xToRadian(this.localPos.x));
    ctx.fillRect(-0.4, -0.2, 0.4, 0.2);
    ctx.restore();
    this.update();
  });
  private flewDistance: number = 0;
  public faceLeft: boolean;

  constructor(
    planet: Planet,
    pos: Position,
    damage: number,
    maxFlyDistance: number,
    faceLeft: boolean,
  ) {
    super(planet);
    this.localPos = pos;
    this.faceLeft = faceLeft;
    this.maxFlyDistance = maxFlyDistance;
    this.damage = damage;
  }

  move(x: number) {
    if (this.faceLeft) {
      x = -x;
    }
    const localPos = this.localPos;
    this.localPos = { ...localPos, x: localPos.x + x };
    this.flewDistance += Math.abs(x);
    if (this.planet.hasTile(this.localPos.x, this.localPos.y)) {
      this.planet.removeTile(
        Math.round(this.localPos.x),
        Math.round(this.localPos.y),
      );
      this.destroy();
    }
  }

  hit(target: Zombie) {
    target.curHp -= this.damage;
    this.emit(new GEvent('bulletGG', this));
    if (target.curHp <= 0) {
      target.emit(new GEvent('zombieDie', target));
    }
  }

  static reload(
    pos: Position,
    damage: number,
    maxFlyDistance: number,
    faceLeft: boolean,
  ) {
    return (bullet: Bullet) => {
      bullet.isAlive = true;
      bullet.localPos = pos;
      bullet.lastUpdated = +new Date();
      bullet.faceLeft = faceLeft;
      bullet.damage = damage;
      bullet.maxFlyDistance = maxFlyDistance;
      bullet.flewDistance = 0;
    };
  }

  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if (!this.isAlive) return;
    if (this.flewDistance >= this.maxFlyDistance) {
      this.emit(new GEvent('bulletGG', this));
    }
    this.lastUpdated = +new Date();
    this.move(this.speed * elapsed);
  }

  destroy() {
    this.planet.removeChild(this.sprite);
    this.planet.objects.delete(this);
  }
}
