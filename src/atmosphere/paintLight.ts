import { Planet } from '../planet/planet';
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
  canvas: HTMLCanvasElement;
  planet: Planet;
  constructor(planet: Planet) {
    this.planet = planet;
    this.canvas = light(Math.max(300, planet.r * planet.cameraScale || 0));
  }

  private maximumSize: number = 3000;
  updateCache() {
    const newSize = this.planet.r * this.planet.cameraScale * 2 * 1.4;
    if (this.maximumSize && newSize > this.maximumSize) {
      return;
    }

    if (newSize > this.canvas.width * 1.1) {
      const oldSize = this.canvas.width;
      try {
        light(newSize, this.canvas);
      } catch (e) {
        this.maximumSize = this.canvas.width;
        console.error(e);
        light(oldSize, this.canvas);
      }
    }
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
  float f_0 = u_radius * 0.8;
  float f_1 = u_radius - 15.0;
  float f_2 = u_radius * 1.1;
  float blue_opacity = 0.6;
  vec4 v_0 = vec4(0, 0, 0, 0);
  vec4 v_1 = vec4(angleMatch * 0.9, angleMatch * 0.9, angleMatch, 0.2);
  vec4 v_2 = vec4(0, 0, 0, 0);
  if (dist < f_0) {
    v_color = vec4(0, 0, 0, 0);
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
