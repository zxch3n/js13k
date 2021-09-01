import { Planet } from '../planet/planet';
import { LocalPosition, toGlobal } from '../position';
import { paint } from './paint';

export function light(
  size: number = 600,
  canvas = document.createElement('canvas'),
  direction: number = 0,
) {
  canvas.width = size;
  canvas.height = size;

  paintLight(canvas, size / 1.4 / 2, direction);
  return canvas;
}

export class Light {
  shadowCache: HTMLCanvasElement;
  planet: Planet;
  canvas: HTMLCanvasElement = document.createElement('canvas');
  constructor(planet: Planet) {
    this.planet = planet;
    this.shadowCache = light(Math.max(300, planet.r * planet.cameraScale || 0));
    this.copyToCanvas();
  }

  private maximumSize: number = 3000;
  updateCache() {
    const newSize = this.planet.r * this.planet.cameraScale * 2 * 1.4;
    if (this.maximumSize && newSize > this.maximumSize) {
      this.copyToCanvas();
      return;
    }

    if (newSize > this.shadowCache.width * 1.1) {
      const oldSize = this.shadowCache.width;
      try {
        light(newSize, this.shadowCache);
      } catch (e) {
        this.maximumSize = this.shadowCache.width;
        console.error(e);
        light(oldSize, this.shadowCache);
      }
    }
    this.copyToCanvas();
  }

  getSizeRate() {
    const newSize = this.planet.r * this.planet.cameraScale * 2 * 1.4;
    return newSize / this.canvas.width;
  }

  private copyToCanvas() {
    this.canvas.width = this.shadowCache.width;
    this.canvas.height = this.shadowCache.height;
    const ctx = this.canvas.getContext('2d')!;
    ctx.drawImage(this.shadowCache, 0, 0);
  }

  clearShadow(pos: LocalPosition, r: number) {
    const gPos = toGlobal(
      { x: pos.x, y: (pos.y * this.planet.cameraScale) / this.getSizeRate() },
      {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
      },
    );
    const ctx = this.canvas.getContext('2d')!;
    ctx.save();
    ctx.translate(gPos.x, gPos.y);
    const radial = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    radial.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = radial;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const r = this.planet.r * 1.4;
    ctx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      -r,
      -r,
      r * 2,
      r * 2,
    );
  }
}

function paintLight(canvas: HTMLCanvasElement, radius: number, angle: number) {
  const paintLogic = `
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  float dist = distance(u_center, a_position); 
  float angle = atan(a_position.x - u_center.x, -a_position.y + u_center.y);
  float angleMatch = max(1.0 - abs(( angle / (2.0 * PI) ) - (${angle.toFixed(
    10,
  )} / 2.0 * PI)) * 3.0, 0.0);
  float f_0 = u_radius * 0.5;
  float f_1 = u_radius - 10.0;
  float f_2 = u_radius * 1.1;
  float blue_opacity = 0.6;
  vec4 v_0 = vec4(0, 0, 0, 1);
  vec4 v_1 = vec4(0, 0, 0, 1.0 - angleMatch * 0.8);
  vec4 v_2 = vec4(0, 0, 0, 0);
  if (dist < f_0) {
    v_color = v_0;
  } else if (dist < f_1) {
    float rate = (dist - f_0) / (f_1 - f_0);
    v_color = v_0 + (v_1 - v_0) * rate;
  } else if (dist < f_2){
    float rate = ( dist - f_1 ) / ( f_2 - f_1 );
    rate = sqrt(rate);
    v_color = v_1 + ( v_2 - v_1 ) * rate;
  } else {
    v_color = vec4(0, 0, 0, 0);
  }
  `;
  paint(canvas, paintLogic, radius);
}
