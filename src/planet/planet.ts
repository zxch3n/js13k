import {
  GlobalPosition,
  LocalPosition,
  TILE_NUM,
  xToRadian,
} from '../position';
import { Sprite } from '../sprite';

/**
 * 多少比例是地心
 */
const CORE_RATE = 0.5;
const TILE_SIZE = 16;

/**
 * 缩很小的时候不知道会不会影响
 */
export class Planet extends Sprite {
  r: number;
  constructor(pos: GlobalPosition, r: number) {
    super((ctx: CanvasRenderingContext2D) => {
      const globalScale = this.globalScale;
      for (const local of this.tilePositions(globalScale)) {
        ctx.save();
        ctx.rotate(xToRadian(local.x));
        ctx.translate(local.y - TILE_SIZE / 2, -TILE_SIZE / 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.restore();
      }
    });
    this.pos = pos;
    this.r = r;
    this.anchor = 0.5;
    this.height = this.width = this.r * 2;
  }

  *tilePositions(scale = 1): Generator<LocalPosition> {
    const step = Math.max(TILE_SIZE / Math.max(scale, 1), 1);
    for (let x = 0; x < TILE_NUM; x += step) {
      for (
        let y = Math.max(this.r * CORE_RATE, this.r - 100, 0);
        y < this.r;
        y += step
      ) {
        yield { x, y };
      }
    }
  }
}
