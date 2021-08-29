export function* range(from: number, to: number, step: number) {
  for (let i = from; i < to; i += step) {
    yield i;
  }
}
