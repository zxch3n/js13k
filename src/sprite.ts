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

  // getRootPos({ x, y }: Position = this.pos): GlobalPosition {
  //   let sprite = this.parent;
  //   const pos = { x, y };
  //   while (sprite) {
  //     pos.x += sprite.pos.x;
  //     pos.y += sprite.pos.y;
  //     pos.x = (pos.x - sprite.origin.x) * sprite.scale + sprite.origin.x;
  //     pos.y = (pos.y - sprite.origin.y) * sprite.scale + sprite.origin.y;
  //     sprite = sprite.parent;
  //   }
  //   return pos;
  // }

  // get origin(): Position {
  //   return {
  //     x: this.width * this.anchor,
  //     y: this.height * this.anchor,
  //   };
  // }

  // inside(pos: Position): boolean {
  //   const { x, y } = pos;
  //   return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
  // }

  // get isStage(): boolean {
  //   return false;
  // }

  // insideStage(pos: GlobalPosition = { x: 0, y: 0 }): boolean {
  //   const stage = this.getStage();
  //   if (!stage) {
  //     return false;
  //   }

  //   const newPos = this.getRootPos(pos);
  //   const isInside = stage.inside(newPos);
  //   if (!isInside) {
  //     console.log(pos, newPos);
  //   }
  //   return isInside;
  // }

  // getStage(): Sprite | undefined {
  //   return this.isStage ? this : this.parent?.getStage();
  // }

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
    {
      ctx.translate(this.pos.x, this.pos.y);
      ctx.translate(
        -this.width * this.anchor * this.scale,
        -this.height * this.anchor * this.scale,
      );
      ctx.rotate(this.rotate);
      ctx.scale(this.scale, this.scale);
      this._draw && this._draw(ctx);
      this.children.forEach((x) => x.draw(ctx));
    }
    ctx.restore();
  }
}
