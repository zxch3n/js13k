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
export const SCALE_FACTOR = TILE_NUM / 2 / Math.PI;
export function toLocal(
  globalPos: GlobalPosition,
  planetPos: GlobalPosition,
): LocalPosition {
  const localX = globalPos.x - planetPos.x;
  const localY = globalPos.y - planetPos.y;
  let angle = Math.atan2(localY, localX);
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
  planetPos: GlobalPosition,
): GlobalPosition {
  const angle = xToRadian(localPos.x);
  const distance = localPos.y;
  const globalX = planetPos.x + distance * Math.cos(angle);
  const globalY = planetPos.y + distance * Math.sin(angle);
  return { x: globalX, y: globalY };
}

export function roundPos<T extends Position>(pos: T): T {
  return { ...pos, x: Math.round(pos.x), y: Math.round(pos.y) };
}
