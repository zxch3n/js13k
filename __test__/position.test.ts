import {
  roundPos,
  toGlobal,
  toLocal,
  LocalPosition,
  GlobalPosition,
} from '../src/position';
describe('position', () => {
  it('convert correctly', () => {
    const planet = { x: 0, y: 0 };
    for (const pos of [
      { x: 0, y: 0 },
      { x: 1, y: 100 },
      { x: 0, y: 10 },
      { x: 1, y: 1 },
      { x: 100, y: 0 },
    ]) {
      pos.y > 0 &&
        expect(roundPos(toLocal(toGlobal(pos, planet), planet))).toStrictEqual(
          pos,
        );
      expect(roundPos(toGlobal(toLocal(pos, planet), planet))).toStrictEqual(
        roundPos(pos),
      );
    }
  });
});
