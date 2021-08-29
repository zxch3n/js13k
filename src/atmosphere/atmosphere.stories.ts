import { Story, Meta } from '@storybook/html';
import { atmosphere } from './atmosphere';

export default {
  title: 'Game/Atmosphere',
  argTypes: {},
} as Meta;

const Template: Story<{}> = (args: {}) => {
  const startTime = performance.now();
  const canvas = atmosphere();
  console.log('USED', performance.now() - startTime);
  const container = document.createElement('div');
  container.style.backgroundColor = 'black';
  container.appendChild(canvas);
  container.style.width = canvas.width + 'px';
  container.style.height = canvas.height + 'px';
  return container;
};

export const Primary = Template.bind({});
Primary.args = {};
