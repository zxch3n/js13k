import {
  GlobalPosition,
  LocalPosition,
  TILE_NUM,
  toGlobal,
  xToRadian,
} from '../position';
import { Sprite } from '../sprite';

/**
 * 多少比例是地心
 */
const CORE_RATE = 0.5;

/**
 * 缩很小的时候不知道会不会影响
 */
export class Planet extends Sprite {
  r: number;
  constructor(pos: GlobalPosition, r: number) {
    super((ctx: CanvasRenderingContext2D) => {
      const globalScale = this.globalScale;
      let minTranslateX = this.r;
      let minY = Infinity;
      let size = 0;
      // 依赖 tilePositions 中 y 是递减的
      for (const local of this.tilePositions(globalScale)) {
        ctx.save();
        ctx.rotate(xToRadian(local.x));
        size = (this.TILE_SIZE * local.y) / this.r / globalScale;
        let translateX: number;
        if (local.y >= minY) {
          translateX = minTranslateX;
        } else {
          minY = local.y;
          translateX = minTranslateX - size;
          minTranslateX = translateX;
        }
        ctx.translate(translateX - size / 2, -size / 2);
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${
          Math.random() * 255
        }, 0, 1)`;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, minTranslateX - size / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.fill();
    });

    this.pos = pos;
    this.r = r;
    this.height = this.width = this.r * 2;
  }

  get TILE_SIZE() {
    if (this.globalScale > 16) {
      return this.globalScale;
    }

    return 16;
  }

  // *tilePositionsInsideViewport(scale = 1): Generator<LocalPosition> {
  //   let i = 0;
  //   for (const local of this.tilePositions(scale)) {
  //     const pos = toGlobal(local);
  //     if (this.insideStage(pos)) {
  //       i++;
  //       yield local;
  //     }
  //   }
  //   console.log(i);
  // }

  *tilePositions(scale = 1): Generator<LocalPosition> {
    const step = Math.max(this.TILE_SIZE / Math.max(scale, 1), 1);
    for (let y = this.r; y > Math.max(this.r * CORE_RATE, 0); y -= step) {
      for (let x = 0; x < TILE_NUM; x += step) {
        yield { x, y };
      }
    }
  }
}
