import { Story, Meta } from '@storybook/html';
import { addControl, Human } from './human';
import { Stage } from './stage';
import { Planet } from './planet/planet';
import { getPlanetMaterial } from './material';
import { TILE_DIRT } from './planet/tiles';
import ZombieSpawn from './zombie';

export default {
  title: 'Game/Human',
  argTypes: {
    scale: {
      defaultValue: 32,
      type: 'number',
      control: {
        type: 'range',
        min: 0.1,
        max: 64,
        step: 0.1,
      },
    },
  },
} as Meta;

interface Props {
  x: number;
  y: number;
  scale: number;
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
const stage = new Stage(canvas);
const planet = new Planet({ x: 0, y: 0 }, 50);
planet.tiles.setTile(0, 50, { type: TILE_DIRT });
planet.removeTile(0, 49);
planet.removeTile(0, 48);
planet.removeTile(0, 47);
for (let i = 50; i > 30; i--) {
  planet.removeTile(-1, i);
}
const human = new Human(planet);
const zombieSpawn = new ZombieSpawn(human, planet);
// human.setMaterial(HumanMaterial);
stage.camera.focus(human);
stage.addChild(planet);
getPlanetMaterial().then(() => {
  requestAnimationFrame(() => {
    stage.draw();
  });
});

(window as any).camera = stage.camera;
(window as any).stage = stage;

addControl(human);
requestAnimationFrame(function draw() {
  stage.draw();
  requestAnimationFrame(draw);
});

function createPlanet({ x = 400, y = 352, scale = 16 }: Props) {
  ctx!.fillStyle = 'black';
  ctx!.fillRect(0, 0, 800, 600);
  planet.pos.x = x;
  planet.pos.y = y;

  stage.camera.scale = Math.max(scale, 1);
  logPerformance(() => {
    stage.draw();
  });
  return canvas;
}

function logPerformance(fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${fn.name} took ${end - start}ms`);
}

const Template: Story<Props> = (args) => {
  // You can either use a function to create DOM elements or use a plain html string!
  // return `<div>${label}</div>`;
  return createPlanet(args);
};

export const Primary = Template.bind({});
Primary.args = {};
