import { Story, Meta } from '@storybook/html';
import { Planet } from '../planet/planet';
import { Stage } from '../stage';
import { Light } from './light';

export default {
  title: 'Game/Light',
  argTypes: {},
} as Meta;

const Template: Story<{}> = (args: {}) => {
  const _canvas = document.createElement('canvas');
  const stage = new Stage(_canvas);
  const planet = new Planet({ x: 0, y: 0 }, 100);
  stage.addChild(planet);
  stage.scale = 3;

  const light = new Light(planet);
  light.updateCache();
  light.clearShadow({ x: 10, y: planet.r }, 20);
  const canvas = light.canvas;

  const container = document.createElement('div');
  container.style.backgroundColor = 'green';
  container.appendChild(canvas);
  container.style.width = canvas.width + 'px';
  container.style.height = canvas.height + 'px';
  return container;
};

export const Primary = Template.bind({});
Primary.args = {};
