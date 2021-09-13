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
function getMappedPos() {
  const r = 1;
  const s = (2 * Math.PI * r) / TILE_NUM;
  const arr = [] as number[];
  let d = 0;
  for (let i = 0; i < 200; i++) {
    arr.push(d);
    d = d + (s * (r - d)) / r;
  }

  return arr;
}

const mappedPos = getMappedPos();
export function getDrawPos(y: number, r: number) {
  if (r <= y) {
    return y;
  }

  const d = r - y;
  const floor = mappedPos[Math.floor(d)];
  const ceil = mappedPos[Math.ceil(d)];
  const sub = floor + (d - Math.floor(d)) * (ceil - floor);
  return (1 - sub) * r;
}

export function getDrawSize(y: number, r: number) {
  if (r <= y) {
    return 1;
  }

  const floor = mappedPos[Math.floor(r - y)];
  const ceil = mappedPos[Math.ceil(r - y)];
  const sub = floor + (y - floor) * (ceil - floor);
  return 1 - sub;
}

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
