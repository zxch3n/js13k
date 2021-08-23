import { Sprite } from './sprite';

export class Stage extends Sprite {
  private ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement) {
    super();
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
    this.anchor = 0.5;
    this.pos = { x: canvas.width / 2, y: canvas.height / 2 };
    if (!this.ctx) {
      throw new Error();
    }
  }

  draw() {
    super.draw(this.ctx);
  }

  get isStage() {
    return true;
  }
}
