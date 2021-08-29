import GameObject from './gameObject';

export default class GEvent{
  constructor(
    public eventName:string,
    public target?:GameObject,
    public extra?:Object
  ) {}

}