import { Position } from './position';
import { CameraTarget } from './type';

export class Camera {
  private target?: CameraTarget;

  width: number;
  height: number;
  pos: Position;
  rotate = 0;
  scale = 1;
  zoom = 1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pos = { x: width / 2, y: height / 2 };
  }

  focus(sprite?: CameraTarget) {
    this.target = sprite;
  }

  update() {
    if (this.target) {
      this.zoom =
        (this.target.getCameraZoom && this.target.getCameraZoom()) || 1;
      this.pos = toMiddle(
        this.target.getCameraPos(),
        {
          x: this.width / 2,
          y: this.height / 2,
        },
        this.scale * this.zoom,
      );
      this.rotate = -this.target.getCameraRotation();
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    drawContainer: (ctx: CanvasRenderingContext2D) => void,
  ) {
    this.update();
    ctx.resetTransform();
    ctx.translate(this.width * 0.5, this.height * 0.5);
    ctx.rotate(this.rotate);
    ctx.translate(-this.width * 0.5, -this.height * 0.5);
    ctx.translate(this.pos.x, this.pos.y);
    ctx.scale(this.scale * this.zoom, this.scale * this.zoom);
    ctx.translate(-this.width * 0.5, -this.height * 0.5);
    drawContainer(ctx);
  }
}

function toMiddle(target: Position, mid: Position, scale: number): Position {
  return {
    x: mid.x - (target.x - mid.x) * scale,
    y: mid.y - (target.y - mid.y) * scale,
  };
}
