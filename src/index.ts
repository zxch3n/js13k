import { Game } from './game';

interface Props {
  x?: number;
  y?: number;
  scale?: number;
}

const canvas = document.createElement('canvas');
document.body.style.height = '100vh';
document.body.style.width = '100vw';
document.body.style.margin = '0';
canvas.width = Math.max(document.body.clientWidth, 400);
canvas.height = Math.max(document.body.clientHeight, 400);
const game = new Game(canvas);
game.start();
document.body.appendChild(canvas);
