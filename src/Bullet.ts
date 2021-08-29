import { Sprite } from './sprite';
import {Position, xToRadian } from './position';
import GameObject from './gameObject';

export default class Bullet extends GameObject{
  sprite:Sprite = new Sprite((ctx) => {
      ctx.save();
      ctx.fillStyle = 'orange';
      ctx.rotate(xToRadian(this.localPos.x));
      ctx.fillRect(-1, -2, 1, 2);
      ctx.restore();
      this.update();
      }
    )
  private flewDistance:number=0;
  constructor(
    public pos: Position,
    public damage: number,
    public speed: number,
    public faceLeft: boolean,
    public maxFlyDistance: number=30
  ) {
    super();
    this.localPos = pos;
  }

  move(x: number){
    if (this.faceLeft){
      x = -x;
    }
    const localPos = this.localPos;
    this.localPos = {...localPos, x: localPos.x + x};
  }

  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if (this.flewDistance >= this.maxFlyDistance){
      this.isAlive = false;
      this.sprite._draw = ctx => {}
    }
    this.lastUpdated = +new Date();
    this.move(this.speed);
  }

}