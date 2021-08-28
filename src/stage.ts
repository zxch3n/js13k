import { Camera } from './camera';
import { Sprite } from './sprite';

export class Stage extends Sprite {
  camera: Camera;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera(canvas.width, canvas.height);
    if (!this.ctx) {
      throw new Error();
    }
  }

  draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.camera.draw(this.ctx, super.draw.bind(this));
  }

  get isStage() {
    return true;
  }

  get cameraScale(): number {
    return this.scale * this.camera.scale;
  }

  getCamera() {
    return this.camera;
  }
}
