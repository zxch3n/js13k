import { Story, Meta } from '@storybook/html';
import { atmosphere } from './atmosphere';

export default {
  title: 'Game/Atmosphere',
  argTypes: {},
} as Meta;

const Template: Story<{}> = (args: {}) => {
  return atmosphere();
};

export const Primary = Template.bind({});
Primary.args = {};
