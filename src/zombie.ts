import GameObject, {
  Attacker,
  getDirection,
  Life,
  ObjectPool,
} from './gameObject';
import { Human } from './human';
import { ZombieMaterial } from './material';
import { Planet } from './planet/planet';
import { distance } from './position';
import { Sprite } from './sprite';

const ALPHA = 0.1;
export default class ZombieSpawn extends ObjectPool<Zombie> {
  maxZombieNum = 10;
  human: Human;
  planet: Planet;
  zombies: Zombie[] = [];
  constructor(human: Human, planet: Planet) {
    super(([]) => {
      return new Zombie(human);
    });
    this.human = human;
    this.planet = planet;
    setInterval(() => {
      this.zombies = this.zombies.filter((zombie) => zombie.isAlive);
      if (this.zombies.length >= this.maxZombieNum) return;
      const y = this.planet.r + 10;
      const x = Math.round(Math.random() * 100) + this.human.localPos.x - 50; // TODO 不在人范围太近
      this.instantiate((zombie) => {
        zombie.localPos = { x, y };
        zombie.curHp = zombie.maxHp;
        zombie.isAlive = true;
        this.planet.addChild(zombie.sprite);
        this.zombies.push(zombie);
      });
    }, 3000);
  }
}

export class Zombie extends GameObject implements Life, Attacker {
  attackInterval: number = 2;
  moveSpeed: number = 0.03;
  maxHp: number = 50;
  curHp: number = 50;
  damage: number = 10;
  lastFireTime: number = 0;
  attackDistance = 1;
  hatredDistance: number = 20; // 仇恨距离
  faceLeft: boolean = true;
  lastChangeDir: number = 0;
  changeFaceFrequency: number = Math.random() * 3000 + 2000;
  human: Human;
  sprite: Sprite;
  planet: Planet;

  constructor(human: Human) {
    super(human.planet);
    this.human = human;
    this.planet = human.planet;
    this.sprite = this.buildSprite(ZombieMaterial);
    this.addListener('zombieDie', (event) => {
      this.die();
    });
    this.moveSpeed += Math.random() * 0.02 - 0.01;
  }

  die() {
    this.isAlive = false;
    this.human.planet.removeChild(this.sprite);
    this.destroy();
  }

  lastJump = Date.now();
  jump() {
    if (this.getOnGround() && Date.now() - this.lastJump > 1000) {
      this.speedY = 0.1;
      this.lastJump = Date.now();
    }
  }

  speedY = 0;
  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if (!this.isAlive) return;
    this.gravity(elapsed);

    this.lastUpdated = +new Date();
    // 判断和子弹的碰撞
    for (const bullet of this.human.bullets) {
      if (distance(bullet.localPos, this.localPos) > 1) {
        continue;
      }
      bullet.hit(this);
      if (this.curHp <= 0) {
        this.die();
      }
    }
    if (!this.isAlive) return;
    const time = +new Date();
    if (time - this.lastChangeDir > this.changeFaceFrequency) {
      this.faceLeft = !this.faceLeft;
      this.lastChangeDir = time;
      this.changeFaceFrequency = Math.random() * 3000 + 2000;
    }

    const distanceToHuman = distance(this.human.localPos, this.localPos);
    if (distanceToHuman > this.hatredDistance) {
      if (this.faceLeft) {
        this.move(-this.moveSpeed, this.speedY);
      } else {
        this.move(this.moveSpeed, this.speedY);
      }
    } else {
      const f = this.human.localPos.x - this.localPos.x;
      // try to jump if facing obstacle
      if (
        this.planet.hasTile(
          Math.round(this.localPos.x) + getDirection(f),
          this.localPos.y,
        ) ||
        this.planet.hasCollide(this, {
          x: Math.round(this.localPos.x) + getDirection(f),
          y: this.localPos.y,
        })
      ) {
        this.jump();
      }

      this.faceLeft = f > 0;
      this.move(this.moveSpeed * getDirection(f), this.speedY);
      if (distanceToHuman < 1.2) {
        this.bite();
      }
    }
    // 判断和人的距离
    // 如果离人远，在附近晃悠
    // 如果离人近，就追
  }

  lastBite = 0;
  private bite() {
    if (Date.now() - this.lastBite < 500) {
      return;
    }

    const d = getDirection(this.human.localPos.x - this.localPos.x);
    this.move(d * 0.1, 0, true);
    this.lastBite = Date.now();
    this.human.hurt(5, this.localPos);
  }
}
