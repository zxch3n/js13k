import { Attacker, ObjectPool } from './gameObject';
import Bullet from './Bullet';
import { Position } from './position';
import { Human } from './human';
import playBulletSound from './sound/soundEffect';

export class Gun extends ObjectPool<Bullet> implements Attacker {
  attackInterval = 300;
  lastFireTime = 0;
  human: Human;
  attackDistance = 50;
  damage = 20;

  constructor(human: Human) {
    super(([pos, damage, distance, faceLeft]) => {
      return new Bullet(human.planet, pos, damage, distance, faceLeft);
    });
    this.human = human;
  }

  fire() {
    const date = +new Date();
    if (+new Date() - this.lastFireTime < this.attackInterval) {
      return;
    }
    playBulletSound();
    this.lastFireTime = date;
    let x;
    if (this.human.faceLeft) {
      x = this.human.localPos.x - 0.5;
    } else {
      x = this.human.localPos.x + 1;
    }
    const pos: Position = { x: x, y: this.human.localPos.y - 0.15 };
    let bullet = this.instantiate(
      Bullet.reload(pos, this.damage, this.attackDistance, this.human.faceLeft),
      pos,
      this.damage,
      this.attackDistance,
      this.human.faceLeft,
    ) as Bullet;
    this.human.planet.addChild(bullet.sprite);
    this.human.bullets.push(bullet);
    bullet.addListener('bulletGG', (event) => {
      const bullet: Bullet = event.target as Bullet;
      bullet.isAlive = false;
      this.human.bullets = this.human.bullets.filter((x) => x !== bullet);
      bullet.destroy();
    });
  }
}
