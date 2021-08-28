import { Position } from './position';
import { Sprite } from './sprite';
import { CameraTarget } from './type';

export class Camera {
  _camera = new Sprite();
  private target?: CameraTarget;
  get pos() {
    return this._camera.pos;
  }

  constructor(width: number, height: number) {
    this._camera.width = width;
    this._camera.height = height;
    this._camera.anchor = 0.5;
    this._camera.pos = { x: width / 2, y: height / 2 };
  }

  focus(sprite?: CameraTarget) {
    this.target = sprite;
  }

  update() {
    if (this.target) {
      this._camera.pos = toMiddle(
        this.target.getCameraPos(),
        {
          x: this._camera.width / 2,
          y: this._camera.height / 2,
        },
        this.scale,
      );
      this._camera.rotate = -this.target.getCameraRotation();
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    drawContainer: (ctx: CanvasRenderingContext2D) => void,
  ) {
    this.update();
    ctx.resetTransform();
    ctx.translate(
      this._camera.width * this._camera.anchor,
      this._camera.height * this._camera.anchor,
    );
    ctx.rotate(this._camera.rotate);
    ctx.translate(
      -this._camera.width * this._camera.anchor,
      -this._camera.height * this._camera.anchor,
    );
    ctx.translate(this.pos.x, this.pos.y);
    ctx.translate(
      -this._camera.width * this._camera.anchor * this.scale,
      -this._camera.height * this._camera.anchor * this.scale,
    );
    ctx.scale(this.scale, this.scale);
    drawContainer(ctx);
  }

  set scale(v: number) {
    this._camera.scale = v;
  }

  get scale() {
    return this._camera.scale;
  }
}

function toMiddle(target: Position, mid: Position, scale: number): Position {
  return {
    x: mid.x - (target.x - mid.x) * scale,
    y: mid.y - (target.y - mid.y) * scale,
  };
}
