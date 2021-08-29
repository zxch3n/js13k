import GEvent from './Event';
import { LocalPosition, toGlobal } from './position';
import { Sprite } from './sprite';
export default abstract class GameObject{
  sprite?:Sprite
  isAlive=true  // if !isAlive Don't render
  listeners: {[event: string]: {(event:GEvent): void}[]} = { all: [] };

  protected lastUpdated = 0;

  addListener(eventName:string, listener:{(event:GEvent): void}):void{
    if (!(eventName in this.listeners)){
      // Not registered
      this.listeners[eventName]=[];
    }
    this.listeners[eventName].push(listener)
  }

  emit(event:GEvent):void{
    if (event.eventName in this.listeners){
      for (const listener of this.listeners[event.eventName]){
        listener(event)
      }
    }
  }

  get localPos() {
    return this.sprite!.localPos();
  }

  set localPos(pos: LocalPosition) {
    this.sprite!.pos = toGlobal(pos);
  }

  abstract update():void;
}

class ObjectPool{
  private pool: GameObject[] = [];

  constructor(protected factory: ()=>GameObject){}

  instantiate(initCall?:(item:GameObject)=>void):GameObject{
    let item = this.findAliveItem()
    if (!item){
      item = this.factory();
    }
    if(initCall){
      initCall(item);
    }
    return item
  }

  private findAliveItem():GameObject|undefined{
    let items = this.pool.filter(x => !x.isAlive)
    return items.pop()
  }
}