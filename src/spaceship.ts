import GameObject from './gameObject';
import { Human } from './human';
import { FiringSpaceshipMaterial, SpaceshipMaterial } from './material';
import { collide } from './planet/collide';
import { Planet } from './planet/planet';
import { Position, TILE_NUM, xToRadian } from './position';
import { CameraTarget } from './type';

export class Spaceship extends GameObject implements CameraTarget {
  private found = false;
  private human: Human;
  constructor(planet: Planet, human: Human) {
    super(planet);
    this.human = human;
    this.sprite = this.buildSprite(SpaceshipMaterial);
    this.sprite.width = 1.5;
    this.sprite.height = 4.5;
    this.sprite.anchor = 0.5;
    planet.addChild(this.sprite);
    this.localPos = { x: Math.floor(Math.random() * TILE_NUM), y: 24 };
    // this.localPos = { x: 0, y: 24 };
    this.addListener('found', () => {
      const originPos = { ...this.localPos };
      const startTime = Date.now();
      const shake = () => {
        if (Date.now() - startTime > 3000) {
          this.sprite.setMaterial(FiringSpaceshipMaterial);
        }

        if (Date.now() - startTime > 4000) {
          this.localPos = originPos;
          return;
        }

        this.localPos.x = Math.random() * 0.1 + originPos.x;
        this.localPos.y = Math.random() * 0.1 + originPos.y;
        requestAnimationFrame(shake);
      };

      shake();
    });
  }

  getCameraZoom(): number {
    return this.planet.r / this.localPos.y;
  }

  getCameraPos(): Position {
    return this.sprite.getStagePos();
  }

  getCameraRotation(): number {
    return xToRadian(this.localPos.x);
  }

  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if (!this.found) {
      if (collide(this.human.localPos, this)) {
        this.found = true;
        this.emit({ eventName: 'found' });
        console.log('FOUND!!!');
      }
    }

    this.move(this.speedX, this.speedY, true);
    this.lastUpdated = +new Date();
  }
}
