import { Atmosphere } from '../atmosphere/atmosphere';
import { Light } from '../atmosphere/light';
import { CacheDraw } from '../cacheDraw';
import { getPlanetMaterial, getPlanetMaterialSurface } from '../material';
import {
  getDrawPos,
  GlobalPosition,
  LocalPosition,
  TILE_NUM,
  xToRadian,
} from '../position';
import { Sprite } from '../sprite';
import { LightSource } from '../type';
import { Tile, Tiles, TILE_DIRT, TILE_EMPTY } from './tiles';

/**
 * 多少比例是地心
 */
export const CORE_RATE = 0.5;

/**
 * 缩很小的时候不知道会不会影响
 *
 * FIXME: planet & human 之间有个间隔
 */
export class Planet extends Sprite {
  r: number;
  mass: number = 1;
  cache: CacheDraw = new CacheDraw();
  static material?: HTMLCanvasElement;
  static materialSurface?: HTMLCanvasElement;
  private atmosphere = new Atmosphere(this);
  private light = new Light(this);
  tiles: Tiles;

  private drawPlanetOnCache = (ctx: CanvasRenderingContext2D) => {
    const globalScale = this.cameraScale;
    ctx.save();
    ctx.scale(globalScale, globalScale);
    let minTranslateX = this.r;
    let minY = Infinity;
    let size = 0;
    // 依赖 tilePositions 中 y 是递减的
    for (const local of this.tilePositions(globalScale)) {
      if (local.type === TILE_EMPTY) {
        continue;
      }

      ctx.save();
      ctx.rotate(xToRadian(local.x) - Math.PI / 2);
      size = (this.TILE_SIZE * local.y) / this.r / globalScale;
      const scale = size / 32;
      let translateX: number = getDrawPos(local.y, this.r) - 1; // TODO: why;
      if (globalScale < 16) {
        if (local.y >= minY) {
          translateX = minTranslateX;
        } else {
          minY = local.y;
          translateX = minTranslateX - size;
          minTranslateX = translateX;
        }
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
        if (Planet.materialSurface && local.isSurface) {
          ctx.drawImage(Planet.materialSurface, 0, 0);
        } else {
          ctx.drawImage(Planet.material, 0, 0);
        }
      }
      ctx.restore();
    }

    ctx.beginPath();
    // ctx.arc(0, 0, this.r * CORE_RATE, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  constructor(pos: GlobalPosition, r: number) {
    super((ctx: CanvasRenderingContext2D) => {});
    this.pos = pos;
    this.r = r;
    this.tiles = new Tiles(TILE_NUM, r);
    this.height = this.width = this.r * 2;
    this.anchor = 0.5;
    this.tiles.random();
    this.updateCache();
    getPlanetMaterial().then((v) => {
      Planet.material = v;
      this.cache.clearCache();
    });
    getPlanetMaterialSurface().then((v) => {
      Planet.materialSurface = v;
      this.cache.clearCache();
    });
  }

  addLightSource(lightSource: LightSource) {
    this.light.lightSources.push(lightSource);
  }

  private updateCache() {
    this.atmosphere.updateCache();
    this.light.updateCache();
    this.cache.setSize(this.width + 100, this.height + 100);
    this.cache.setScale(this.cameraScale);
    this.cache.rotate = this.rotate;
  }

  override draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    this.updateCache();
    this.atmosphere.draw(ctx);
    this.cache.draw(ctx, this.drawPlanetOnCache);
    this.light.draw(ctx);
    ctx.restore();
    ctx.save();
    this.setDrawTransform(ctx);
    this.children.forEach((x) => x.draw(ctx));
    ctx.restore();
  }

  get TILE_SIZE() {
    if (this.cameraScale > 16) {
      return this.cameraScale;
    }

    return 16;
  }

  getDistanceToSurface(x: number, y: number) {
    return this.tiles.getDistanceToSurface(x, y);
  }

  hasTile(x: number, y: number) {
    const tile = this.tiles.getTile(x, y);
    if (!tile) {
      return false;
    }

    return tile.type !== TILE_EMPTY;
  }

  removeTile(x: number, y: number) {
    this.tiles.setTile(x, y, { type: TILE_EMPTY });
    this.cache.clearCache();
  }

  *tilePositions(
    scale = 1,
  ): Generator<
    LocalPosition & { toSurface: number; isSurface: boolean } & Tile
  > {
    const step = Math.max(this.TILE_SIZE / Math.max(scale, 1), 1);
    for (let y = this.r; y > Math.max(this.r * CORE_RATE, 0); y -= step) {
      for (let x = 0; x < TILE_NUM; x += step) {
        const tile = this.tiles.getTile(x, y);
        const toSurface = this.tiles.getDistanceToSurface(x, y);
        yield {
          x,
          y,
          toSurface,
          type: tile.type,
          isSurface:
            tile.type === TILE_DIRT &&
            this.tiles.getTile(x, y + 1).type === TILE_EMPTY,
        };
      }
    }
  }
}

export function getDistancesToCore(r: number, globalScale: number) {
  const arr: number[] = [];
  const TILE_SIZE = 16;
  let posY = r;
  let size = (TILE_SIZE * posY) / r / globalScale;
  let last = r;
  for (let i = 0; i < 100; i++) {
    arr.push(last);
    last -= size;
    size = (TILE_SIZE * posY) / r / globalScale;
  }

  return arr;
}

export function planetChildDraw(
  ctx: CanvasRenderingContext2D,
  planet: Planet,
  pos: LocalPosition,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  ctx.save();
  draw(ctx);
  ctx.restore();
}
