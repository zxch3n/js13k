import { Planet } from './planet/planet';
import { Stage } from './stage';

export { add } from './add';

interface Props {
  x: number;
  y: number;
  scale: number;
}

function createPlanet({ x, y, scale }: Props) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;

  const ctx = canvas.getContext('2d');
  ctx!.fillStyle = 'black';
  ctx!.fillRect(0, 0, 800, 600);

  const stage = new Stage(canvas);
  stage.addChild(new Planet({ x, y }, 50));
  stage.scale = scale;
  stage.draw();
  return canvas;
}

const canvas = createPlanet({ x: 0, y: 0, scale: 1 });

const div = document.createElement('div');
div.appendChild(canvas);
document.body.appendChild(div);
