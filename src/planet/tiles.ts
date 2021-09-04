import { CORE_RATE } from './planet';

export const TILE_EMPTY = 0;
export const TILE_DIRT = 1;

export interface Tile {
  type: number;
}

export class Tiles {
  width: number;
  r: number;
  private data: Uint8Array;
  #cacheValid = false;
  constructor(width: number, r: number) {
    this.width = width;
    this.r = r;
    this.data = new Uint8Array(width * (r + 1));
    this.data.fill(TILE_DIRT);
  }

  private toIndex(x: number, y: number): number {
    return (y % (this.r + 1)) * this.width + (x % this.width);
  }

  getTile(x: number, y: number): Tile {
    x = Math.round(x);
    y = Math.round(y);
    return { type: this.data[this.toIndex(x, y)] };
  }

  setTile(x: number, y: number, tile: Tile) {
    this.data[this.toIndex(x, y)] = tile.type;
    this.#cacheValid = false;
  }

  getDistanceToSurface(x: number, y: number): number {
    if (!this.#cacheValid) {
      this.updateCache();
    }

    x = Math.round(x) % this.width;
    return y - this.#surfaceTile[x];
  }

  #surfaceTile: number[] = [];
  private updateCache() {
    this.#cacheValid = true;
    this.#surfaceTile.length = 0;
    for (let i = 0; i < this.width; i++) {
      let j = this.r;
      for (
        j = this.r;
        j > Math.floor(this.r * CORE_RATE) &&
        this.getTile(i, j).type === TILE_EMPTY;
        j--
      );

      this.#surfaceTile[i] = j ?? 0;
    }
  }
}
