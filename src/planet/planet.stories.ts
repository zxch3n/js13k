import { Story, Meta } from '@storybook/html';
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
        max: 32,
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
