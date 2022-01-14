let tick = 1;
let maxTick = 65535;
let resolution = 4;
let timer: number;
let inc = function () {
  tick = (tick + 1) & maxTick;
};

export function speed(seconds?: number) {
  if (!timer) {
    // @ts-ignore
    timer = setInterval(inc, (1000 / resolution) | 0);
  }

  let size = resolution * (seconds || 5);
  let buffer = [0];
  let pointer = 1;
  let last = (tick - 1) & maxTick;

  return function (delta: number) {
    let dist = (tick - last) & maxTick;
    if (dist > size) dist = size;
    last = tick;

    while (dist--) {
      if (pointer === size) pointer = 0;
      buffer[pointer] = buffer[pointer === 0 ? size - 1 : pointer - 1];
      pointer++;
    }

    if (delta) buffer[pointer - 1] += delta;

    let top = buffer[pointer - 1];
    let btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer];

    return buffer.length < resolution
      ? top
      : (top - btm) * resolution / buffer.length;
  };
}
