import { GlobalPosition, LocalPosition, Position, toLocal } from './position';

let flushPromise: undefined | Promise<void>;
export class Sprite {
  // global position
  parent?: Sprite;
  pos: GlobalPosition = { x: 0, y: 0 };
  children: Sprite[] = [];
  rotate: number = 0;
  scale: number = 1;
  zIndex: number = 0;
  width = 0;
  height = 0;
  anchor = 0;
  _draw?: (ctx: CanvasRenderingContext2D) => void;

  constructor(_draw?: (ctx: CanvasRenderingContext2D) => void) {
    this._draw = _draw;
  }

  get globalScale(): number {
    return this.scale * (this.parent ? this.parent.globalScale : 1);
  }

  localPos(planet: GlobalPosition): LocalPosition {
    return toLocal(this.pos, planet);
  }

  removeChild(child: Sprite) {
    this.children = this.children.filter((x) => x !== child);
  }

  addChild(child: Sprite) {
    this.children.push(child);
    if (child.parent) {
      child.parent.removeChild(child);
    }

    child.parent = this;
    if (!flushPromise) {
      flushPromise = Promise.resolve().then(() => {
        flushPromise = undefined;
        this.children.sort((x) => x.zIndex);
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotate);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.width * this.anchor, -this.height * this.anchor);
    this._draw && this._draw(ctx);
    this.children.forEach((x) => x.draw(ctx));
    ctx.restore();
  }
}
