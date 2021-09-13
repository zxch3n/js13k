import { Camera } from './camera';
import {
  GlobalPosition,
  LocalPosition,
  PIXEL_TO_GLOBAL_COORDINATE,
  Position,
  toLocal,
} from './position';

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
  material?: HTMLCanvasElement;
  _draw?: (ctx: CanvasRenderingContext2D) => void;

  constructor(_draw?: (ctx: CanvasRenderingContext2D) => void) {
    this._draw = _draw;
  }

  async setMaterial(material: Promise<HTMLCanvasElement>) {
    this.material = await material;
  }

  get cameraScale(): number {
    return this.scale * (this.parent ? this.parent.cameraScale : 1);
  }

  getStagePos(childPos?: Position): GlobalPosition {
    let pos: Position;
    if (childPos) {
      childPos = {
        x: childPos.x * this.scale,
        y: childPos.y * this.scale,
      };
      pos = rotate(childPos, -this.rotate);
    } else {
      pos = { x: 0, y: 0 };
    }

    pos = {
      x: pos.x + this.pos.x,
      y: pos.y + this.pos.y,
    };

    return this.parent ? this.parent.getStagePos(pos) : pos;
  }

  getCamera(): Camera | undefined {
    return this.parent?.getCamera();
  }

  localPos(planet: GlobalPosition = { x: 0, y: 0 }): LocalPosition {
    return toLocal(this.pos, planet);
  }

  removeChild(child: Sprite) {
    this.children = this.children.filter((x) => x !== child);
    // TODO? child.parent = null?
  }

  addChild(child: Sprite) {
    this.children.push(child);
    if (child.parent && child.parent !== this) {
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
    if (this.material) {
      if (this.width * this.height === 0) {
        this.width = this.material.width / PIXEL_TO_GLOBAL_COORDINATE;
        this.height = this.material.height / PIXEL_TO_GLOBAL_COORDINATE;
      }
    }
    ctx.save();
    {
      this.setDrawTransform(ctx);
      this._draw && this._draw(ctx);
      this.children.forEach((x) => x.draw(ctx));
    }
    ctx.restore();
  }

  setDrawTransform(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.width * this.anchor, this.height * this.anchor);
    ctx.rotate(this.rotate);
    ctx.translate(-this.width * this.anchor, -this.height * this.anchor);

    ctx.translate(this.pos.x, this.pos.y);
    ctx.scale(this.scale, this.scale);
  }
}

function rotate(pos: GlobalPosition, angle: number): GlobalPosition {
  const { x, y } = pos;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}
