export interface GlobalPosition {
  x: number;
  y: number;
  t?: 'global';
}

/**
 * polar coordinate position
 */
export interface LocalPosition {
  // angle of polar coordinates
  x: number;
  // distance to the center of the planet
  y: number;
  t?: 'local';
}

export interface Position {
  x: number;
  y: number;
}

export const TILE_NUM = 400;
export const PIXEL_TO_GLOBAL_COORDINATE = 16;
const SCALE_FACTOR = TILE_NUM / 2 / Math.PI;
export function toLocal(
  globalPos: GlobalPosition,
  planetPos: GlobalPosition,
): LocalPosition {
  const localX = globalPos.x - planetPos.x;
  const localY = -(globalPos.y - planetPos.y);
  let angle = Math.atan2(localX, localY);
  let distance = Math.sqrt(localX ** 2 + localY ** 2);
  return { x: radianToX(angle), y: distance };
}

export function xToRadian(x: number) {
  return (x / SCALE_FACTOR) % (2 * Math.PI);
}

export function radianToX(radian: number) {
  return (radian % (2 * Math.PI)) * SCALE_FACTOR;
}

/**
 * invert op of toLocal
 * @param localPos
 */
export function toGlobal(
  localPos: LocalPosition,
  planetPos: GlobalPosition = { x: 0, y: 0 },
): GlobalPosition {
  const angle = xToRadian(localPos.x);
  const distance = localPos.y;
  const globalX = planetPos.x + distance * Math.sin(angle);
  const globalY = planetPos.y - distance * Math.cos(angle);
  return { x: globalX, y: globalY };
}

export function roundPos<T extends Position>(pos: T): T {
  return { ...pos, x: round(pos.x), y: round(pos.y) };
}

function round(v: number) {
  if (Math.abs(v) < 1e-6) {
    return 0;
  }

  return Math.round(v);
}
