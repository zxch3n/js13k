import { LocalPosition, Position } from './position';

export interface CameraTarget {
  getCameraPos(): Position;
  getCameraRotation(): number;
}

export interface LightSource {
  getLightPos(): LocalPosition;
  getLightRadius(): number;
}
