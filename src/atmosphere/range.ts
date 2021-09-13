export function* range(from: number, to: number, step?: number) {
  if (from > to) {
    step = step ?? -1;
    for (let i = from; i > to; i += step) {
      yield i;
    }
  } else {
    step = step ?? 1;
    for (let i = from; i < to; i += step) {
      yield i;
    }
  }
}
