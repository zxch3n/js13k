import { Story, Meta } from '@storybook/html';
import { Human } from '../human';
import { Stage } from '../stage';
import { Planet } from './planet';

export default {
  title: 'Game/Planet',
  argTypes: {
    x: {
      defaultValue: 400,
      type: 'number',
      control: {
        type: 'range',
        min: 0,
        max: 800,
      },
    },
    y: {
      defaultValue: 345,
      type: 'number',
      control: {
        type: 'range',
        min: 0,
        max: 600,
      },
    },
    scale: {
      defaultValue: 1,
      type: 'number',
      control: {
        type: 'range',
        min: 0.1,
        max: 128,
        step: 0.1,
        default: 16,
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
stage.addChild(planet);
planet.removeTile(0, 50);

/**
 * FIXME: CANNOT clear cache inside createPlanet
 */
function createPlanet({ x, y, scale }: Props) {
  ctx!.fillStyle = 'black';
  ctx!.fillRect(0, 0, 800, 600);
  planet.pos.x = x;
  planet.pos.y = y;

  stage.camera.scale = Math.max(scale, 1);
  stage.draw();
  // requestAnimationFrame(function update() {
  //   stage.draw();
  //   // planet.rotate += 0.002;
  //   requestAnimationFrame(update);
  // });
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
