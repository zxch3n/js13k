import { Game } from './game';

interface Props {
  x?: number;
  y?: number;
  scale?: number;
}

const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
const game = new Game(canvas);
game.start();
document.body.appendChild(canvas);
