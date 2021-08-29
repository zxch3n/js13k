/**
 * Default origin 50% 50%
 */

export class CacheDraw {
  canvas = document.createElement('canvas');
  cached: boolean = false;
  private ctx = this.canvas.getContext('2d')!;
  targetSize: { width: number; height: number } = { width: 0, height: 0 };
  targetScale = 1;

  setScale(v: number) {
    this.targetScale = v;
    this.update();
  }

  setSize(width: number, height: number) {
    this.targetSize = { width, height };
    this.update();
  }

  private update() {
    if (
      changed(this.targetSize.width * this.targetScale, this.canvas.width) ||
      changed(this.targetSize.height * this.targetScale, this.canvas.height)
    ) {
      this.canvas.width = this.targetSize.width * this.targetScale;
      this.canvas.height = this.targetSize.height * this.targetScale;
      this.clearCache();
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ) {
    if (!this.cached) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.resetTransform();
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      draw(this.ctx);
    }

    ctx.save();
    ctx.translate(-this.targetSize.width / 2, -this.targetSize.height / 2);
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.targetSize.width,
      this.targetSize.height,
    );
    ctx.restore();
    this.cached = true;
  }

  clearCache() {
    this.cached = false;
  }
}

function changed(a: number, b: number): boolean {
  if (a > b) {
    [a, b] = [b, a];
  }

  if (a === 0) {
    return true;
  }

  if (b / a > 1.1) {
    return true;
  }
  return false;
}
