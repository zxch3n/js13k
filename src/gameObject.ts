import { Planet } from './planet/planet';
import {
  getDrawPos,
  LocalPosition,
  PIXEL_TO_GLOBAL_COORDINATE,
  toGlobal,
  xToRadian,
} from './position';
import { Sprite } from './sprite';
export default abstract class GameObject {
  sprite: Sprite;
  faceLeft: boolean = false;
  isAlive = true; // if !isAlive Don't render
  listeners: { [event: string]: { (event: GEvent): void }[] } = { all: [] };
  planet: Planet;

  protected lastUpdated = +new Date();

  protected constructor(planet: Planet) {
    this.sprite = this.buildSprite();
    this.planet = planet;
  }

  getOnGround(pos = this.localPos) {
    return this.planet.hasTile(pos.x, pos.y - 1);
  }

  buildSprite(material?: Promise<HTMLCanvasElement>) {
    const sprite = new Sprite((ctx) => {
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
        const scale = this.localPos.y / (this.planet?.r || 50);
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
    if (material) sprite.setMaterial(material);
    sprite.draw = (ctx) => {
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
    return sprite;
  }

  addListener(eventName: string, listener: { (event: GEvent): void }): void {
    if (!(eventName in this.listeners)) {
      // Not registered
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  emit(event: GEvent): void {
    if (event.eventName in this.listeners) {
      for (const listener of this.listeners[event.eventName]) {
        listener(event);
      }
    }
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

  abstract update(): void;
}

export class GEvent {
  public eventName: string;
  public target?: GameObject;
  public extra?: Object;

  constructor(eventName: string, target?: GameObject, extra?: Object) {
    this.eventName = eventName;
    this.target = target;
    this.extra = extra;
  }
}

export class ObjectPool<T extends GameObject> {
  private pool: T[] = [];
  protected factory: ([]) => T;
  constructor(fac: ([]) => T) {
    this.factory = fac;
  }

  instantiate(initCall?: (item: T) => void, ...args: unknown[]): T {
    let item = this.findAliveItem();
    if (!item) {
      item = this.factory(args);
      this.pool.push(item);
    }
    if (initCall) {
      initCall(item);
    }
    return item;
  }

  private findAliveItem(): T | undefined {
    let items = this.pool.filter((x) => !x.isAlive);
    return items.pop();
  }
}

export interface Life {
  maxHp: number;
  curHp: number;
}

export interface Attacker {
  damage: number;
  attackDistance: number;
  attackInterval: number;
  lastFireTime: number;
}

export function getDirection(x: number) {
  if (Math.abs(x) < 0.0001) return 0;
  return x < 0 ? -1 : 1;
}

export function absMax(a: number, b: number) {
  if (Math.abs(a) > Math.abs(b)) {
    return a;
  }

  return b;
}
