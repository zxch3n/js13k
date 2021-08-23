import { Sprite } from './sprite';

export class Stage extends Sprite {
  private ctx: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement) {
    super();
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) {
      throw new Error();
    }
  }

  draw() {
    super.draw(this.ctx);
  }
}
