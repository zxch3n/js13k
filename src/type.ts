import { Position } from './position';

export interface CameraTarget {
  getCameraPos(): Position;
  getCameraRotation(): number;
}
