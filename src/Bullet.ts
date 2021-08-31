import { Sprite } from './sprite';
import {Position, xToRadian } from './position';
import GameObject from './gameObject';

export default class Bullet extends GameObject{
  sprite:Sprite = new Sprite(Bullet.drawSelf(this))
  private flewDistance:number=0;
  public speed: number;
  public faceLeft: boolean;
  public damage: number=20;
  public maxFlyDistance: number=50
  constructor(pos: Position, speed: number, faceLeft: boolean) {
    super();
    this.localPos = pos;
    this.speed = speed;
    this.faceLeft = faceLeft;
  }

  static drawSelf(bullet:Bullet){
    return (ctx: CanvasRenderingContext2D)=>{
      ctx.save();
      ctx.fillStyle = 'orange';
      ctx.rotate(xToRadian(bullet.localPos.x));
      ctx.fillRect(-0.4, -0.2, 0.4, 0.2);
      ctx.restore();
      bullet.update();
    }
  }

  move(x: number){
    if (this.faceLeft){
      x = -x;
    }
    const localPos = this.localPos;
    this.localPos = {...localPos, x: localPos.x + x};
    this.flewDistance += Math.abs(x);
  }

  static reload(pos:Position, speed:number, faceLeft:boolean){
    return (bullet:Bullet) => {
      bullet.isAlive = true;
      bullet.localPos = pos;
      bullet.speed = speed;
      bullet.lastUpdated = +new Date();
      bullet.faceLeft = faceLeft;
      bullet.flewDistance = 0;
      bullet.sprite._draw = this.drawSelf(bullet);
    }
  }

  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if (this.flewDistance >= this.maxFlyDistance){
      this.isAlive = false;
      this.sprite._draw = ()=>{}
    }
    this.lastUpdated = +new Date();
    this.move(this.speed * elapsed);
  }

}