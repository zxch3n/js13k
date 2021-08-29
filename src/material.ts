import ImgSrc from '../assets/ground.png';

const img = new Image();
const promise = new Promise<HTMLImageElement>((resolve, reject) => {
  img.onload = () => resolve(img);
  img.onerror = reject;
});

img.src = ImgSrc;
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
