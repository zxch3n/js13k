import { getPlanetMaterial, getPlanetMaterialSurface } from '../material';
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

/**
 * 缩很小的时候不知道会不会影响
 *
 * FIXME: planet & human 之间有个间隔
 */
export class Planet extends Sprite {
  r: number;
  mass: number = 1;
  static material?: HTMLCanvasElement;
  static materialSurface?: HTMLCanvasElement;
  constructor(pos: GlobalPosition, r: number) {
    super((ctx: CanvasRenderingContext2D) => {
      const globalScale = this.cameraScale;
      let minTranslateX = this.r;
      let minY = Infinity;
      let size = 0;
      // 依赖 tilePositions 中 y 是递减的
      for (const local of this.tilePositions(globalScale)) {
        ctx.save();
        ctx.rotate(xToRadian(local.x));
        size = (this.TILE_SIZE * local.y) / this.r / globalScale;
        const scale = size / 32;
        let translateX: number;
        if (local.y >= minY) {
          translateX = minTranslateX;
        } else {
          minY = local.y;
          translateX = minTranslateX - size;
          minTranslateX = translateX;
        }
        ctx.translate(translateX - size / 2, -size / 2);
        if (!Planet.material) {
          ctx.scale(scale, scale);
          ctx.fillStyle = `rgba(${
            (Math.cos(local.x) * local.x * local.y * 929) % 255
          }, ${(local.y * local.y * 263) % 255}, 0, 1)`;
          ctx.fillRect(0, 0, 32, 32);
        } else {
          ctx.scale(scale, scale);
          ctx.translate(16, 16);
          ctx.rotate(Math.PI / 2);
          ctx.translate(-16, -16);
          if (Planet.materialSurface && this.r < local.y + 0.5) {
            ctx.drawImage(Planet.materialSurface, 0, 0);
          } else {
            ctx.drawImage(Planet.material, 0, 0);
          }
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${(local.toSurface * 3) / this.r})`;
        ctx.fillRect(0, 0, 32, 32);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, minTranslateX - size / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'black';
      ctx.fill();
    });

    this.pos = pos;
    this.r = r;
    this.height = this.width = this.r * 2;
    getPlanetMaterial().then((v) => {
      Planet.material = v;
    });
    getPlanetMaterialSurface().then((v) => {
      Planet.materialSurface = v;
    });
  }

  get TILE_SIZE() {
    if (this.cameraScale > 16) {
      return this.cameraScale;
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

  *tilePositions(scale = 1): Generator<LocalPosition & { toSurface: number }> {
    const step = Math.max(this.TILE_SIZE / Math.max(scale, 1), 1);
    for (let y = this.r; y > Math.max(this.r * CORE_RATE, 0); y -= step) {
      for (let x = 0; x < TILE_NUM; x += step) {
        // TODO: get correct to surface value
        yield { x, y, toSurface: this.r - y };
      }
    }
  }
}
