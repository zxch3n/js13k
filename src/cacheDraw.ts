/**
 * Default origin 50% 50%
 */

export class CacheDraw {
  canvas = document.createElement('canvas');
  cached: boolean = false;
  private ctx = this.canvas.getContext('2d')!;
  targetSize: { width: number; height: number } = { width: 0, height: 0 };
  targetScale = 1;
  rotate = 0;
  scale = 1;

  setScale(v: number) {
    this.targetScale = v;
    this.update();
  }

  setSize(width: number, height: number) {
    this.targetSize = { width, height };
    this.update();
  }

  private update() {
    const targetWidth = Math.min(
      this.targetSize.width * this.targetScale,
      2000,
    );
    if (changed(targetWidth, this.canvas.width)) {
      const ratio = this.targetSize.height / this.targetSize.width;
      this.canvas.width = targetWidth;
      this.canvas.height = this.canvas.width * ratio;
      this.scale =
        this.canvas.width / (this.targetSize.width * this.targetScale);
      this.clearCache();
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ) {
    if (!this.cached) {
      console.log('DRAW');
      this.ctx.resetTransform();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.scale(this.scale, this.scale);
      draw(this.ctx);
      this.ctx.resetTransform();
    }

    ctx.save();
    ctx.rotate(this.rotate);

    ctx.drawImage(
      this.canvas,
      -this.targetSize.width / 2,
      -this.targetSize.height / 2,
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

export function changed(a: number, b: number): boolean {
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
