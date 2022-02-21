// Modified from https://github.com/mafintosh/speedometer/blob/master/index.js

// Copyright 2013 Mathias Buus

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

let tick = 1;
let maxTick = 65535;
let resolution = 4;
let timer: number;
let inc = function () {
  tick = (tick + 1) & maxTick;
};

export function speedometer(seconds?: number) {
  if (!timer) {
    // @ts-ignore
    timer = setInterval(inc, (1000 / resolution) | 0);
  }

  let size = resolution * (seconds || 5);
  let buffer = [0];
  let pointer = 1;
  let last = (tick - 1) & maxTick;

  return function (delta = 0) {
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
      : ((top - btm) * resolution) / buffer.length;
  };
}
