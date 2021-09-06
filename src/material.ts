import ImgSrc from '../assets/ground.png';
import TileSrc from '../assets/tiles.png';

const img = new Image();
const promise = new Promise<HTMLImageElement>((resolve, reject) => {
  img.onload = () => resolve(img);
  img.onerror = reject;
});

img.src = ImgSrc;
const tile = new Image();
const tilePromise = new Promise<HTMLImageElement>((resolve, reject) => {
  tile.onload = () => resolve(tile);
  tile.onerror = reject;
});
tile.src = TileSrc;
let ans: Promise<HTMLCanvasElement> | undefined;
export async function getPlanetMaterial(): Promise<HTMLCanvasElement> {
  if (ans) {
    return ans;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = await promise;
  canvas.width = 32;
  canvas.height = 32;
  ctx!.drawImage(image, 0, 32, 32, 32, 0, 0, 32, 32);
  return canvas;
}

export async function getPlanetMaterialSurface(): Promise<HTMLCanvasElement> {
  if (ans) {
    return ans;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = await promise;
  canvas.width = 32;
  canvas.height = 32;
  ctx!.drawImage(image, 0, 0, 32, 32, 0, 0, 32, 32);
  return canvas;
}

export async function getMaterial(
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  if (ans) {
    return ans;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image = await tilePromise;
  canvas.width = width;
  canvas.height = height;
  ctx!.drawImage(image, x, y, width, height, 0, 0, width, height);
  return canvas;
}

export const HumanMaterial = getMaterial(0, 2, 10, 15);
export const ZombieMaterial = getMaterial(0, 18, 10, 14);
