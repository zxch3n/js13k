import { ObjectPool } from './gameObject';
import Bullet from './Bullet';
import { Position } from './position';
import { Human } from './human';

export class Gun extends ObjectPool<Bullet>{
  private attack_interval = 300;
  private last_fire_time = 0;
  private human: Human;

  constructor(human: Human) {
    super(([pos, faceLeft]) => {
      return new Bullet(pos, faceLeft);
    });
    this.human = human;
  }

  fire(){
    const date = +new Date()
    console.log(typeof date);
    if(+new Date() - this.last_fire_time < this.attack_interval){
     return
    }
    this.last_fire_time = date;
    let x;
    if (this.human.faceLeft) {
      x = this.human.localPos.x - 0.5;
    }else{
      x = this.human.localPos.x + 1;
    }
    const pos: Position = {x: x, y: this.human.localPos.y - 0.15}
    let bullet = this.instantiate(
      Bullet.reload(pos, this.human.faceLeft),
      pos,
      this.human.faceLeft,
    ) as Bullet;
    this.human.planet.addChild(bullet.sprite);
    this.human.bullets.push(bullet);
    bullet.addListener("bulletGG", event =>{
      const bullet: Bullet = event.target as Bullet;
      bullet.isAlive = false;
      this.human.planet.removeChild(bullet.sprite);
      this.human.bullets = this.human.bullets.filter((x) => x !== bullet);
    })
  }

}