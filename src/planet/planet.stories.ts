import { Story, Meta } from '@storybook/html';
import { Stage } from '../stage';
import { Planet } from './planet';

export default {
  title: 'Game/Planet',
  argTypes: {},
} as Meta;

function createPlanet() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx!.fillStyle = 'black';
  ctx!.fillRect(0, 0, 800, 600);
  const stage = new Stage(canvas);
  stage.addChild(new Planet({ x: 220, y: 200 }, 50));
  const start = performance.now();
  stage.draw();
  console.log(`${performance.now() - start}ms`);
  return canvas;
}

const Template: Story<{}> = (args) => {
  // You can either use a function to create DOM elements or use a plain html string!
  // return `<div>${label}</div>`;
  return createPlanet();
};

export const Primary = Template.bind({});
Primary.args = {};
