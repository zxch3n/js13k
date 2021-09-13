import GameObject from '../gameObject';
import { LocalPosition } from '../position';

export function collide(pos: LocalPosition, b: GameObject) {
  return (
    Math.round(pos.x) === Math.round(b.localPos.x) &&
    Math.round(pos.y) === Math.round(b.localPos.y)
  );
}
