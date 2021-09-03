import { Sprite } from './sprite';
import {Position, xToRadian, toGlobal } from './position';
import GameObject, { GEvent } from './gameObject';

export default class Bullet extends GameObject{
  damage = 20;
  maxFlyDistance = 50;
  speed = 2;
  sprite:Sprite = new Sprite((ctx: CanvasRenderingContext2D)=>{
    ctx.save();
    ctx.fillStyle = 'orange';
    ctx.rotate(xToRadian(this.localPos.x));
    ctx.fillRect(-0.4, -0.2, 0.4, 0.2);
    ctx.restore();
    this.update();
  })
  private flewDistance:number=0;
  public faceLeft: boolean;


  constructor(pos: Position, faceLeft: boolean) {
    super();
    this.localPos = pos;
    this.faceLeft = faceLeft;
  }

  move(x: number){
    if (this.faceLeft){
      x = -x;
    }
    const localPos = this.localPos;
    this.localPos = {...localPos, x: localPos.x + x};
    this.flewDistance += Math.abs(x);
  }

  static reload(pos:Position, faceLeft:boolean){
    return (bullet:Bullet) => {
      bullet.isAlive = true;
      bullet.localPos = pos;
      bullet.lastUpdated = +new Date();
      bullet.faceLeft = faceLeft;
      bullet.flewDistance = 0;
    }
  }

  update(elapsed: number = (+new Date() - this.lastUpdated) / 60): void {
    if(!this.isAlive)
      return
    if (this.flewDistance >= this.maxFlyDistance){
      this.emit(new GEvent("bulletGG", this))
    }
    this.lastUpdated = +new Date();
    this.move(this.speed * elapsed);
  }

}