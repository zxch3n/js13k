import { LocalPosition, toGlobal, xToRadian } from './position';
import { Sprite } from './sprite';
export default abstract class GameObject {
  sprite: Sprite;
  faceLeft: boolean = false;
  isAlive = true; // if !isAlive Don't render
  listeners: { [event: string]: { (event: GEvent): void }[] } = { all: [] };

  protected lastUpdated = +new Date();

  protected constructor() {
    this.sprite = this.buildSprite();
  }

  buildSprite(material?: Promise<HTMLCanvasElement>){
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
    return sprite
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

  get localPos() {
    return this.sprite!.localPos();
  }

  set localPos(pos: LocalPosition) {
    this.sprite!.pos = toGlobal(pos);
  }

  abstract update(): void;
}

export class GEvent {
  public eventName: string;
  public target?: GameObject;
  public extra?: Object;

  constructor(
    eventName: string,
    target?: GameObject,
    extra?: Object,
  ) {
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

export interface Attacker{
  damage: number;
  attackDistance: number;
  attackInterval: number;
  lastFireTime:number;
}