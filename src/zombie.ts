import GameObject from './gameObject';
import { Human } from './human';

export class Zombie extends GameObject{
  private human:Human;
  private hatredRange = 5;
  private attackDistance = 1;

  constructor(human: Human) {
    super();
    this.human = human;
  }



  update(): void {
    // 判断和人的距离
    // 如果离人远，在附近晃悠
    // 如果离人近，就追

  }
}