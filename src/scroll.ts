import { col, row, TableData } from './data';

function scrollTo(
  data: TableData,
  direction: '+' | '-',
  value: number,
  oldValue: [number, number],
  index: number,
  getValue: (index: number) => number
): boolean {
  let newValue = oldValue[index];
  let changed = false;
  // console.log('value:', value, oldValue[index]);
  if (direction === '+') {
    for (let i = data.scroll[index]; i < data.rows.len; i += 1) {
      if (newValue > value) break;
      newValue += getValue(i);
      data.scroll[index] = i + 1;
      changed = true;
    }
  } else {
    for (let i = data.scroll[index]; i > 0; i -= 1) {
      if (newValue < value) break;
      newValue -= getValue(i);
      data.scroll[index] = i - 1;
      changed = true;
    }
  }
  oldValue[index] = newValue;
  return changed;
}

/**
function step(
  data: TableData,
  index: number,
  n: number,
  oldValue: [number, number],
  getValue: (index: number) => number
): number | undefined {
  const start = data.scroll[index];

  let end = start + n;
  if (end <= 0) end = 0;
  if (end > data.rows.len) end = data.rows.len;

  let newValue = oldValue[index];
  if (n > 0) {
    for (let i = start; i < end; i += 1) {
      if (i >= data.rows.len) break;
      newValue += getValue(i);
    }
  } else {
    for (let i = end; i < start; i += 1) {
      newValue -= getValue(i);
    }
  }
  data.scroll[index] = end;
  oldValue[index] = newValue;
  return data.scroll[index];
}
*/

export default class Scroll {
  // [x, y]
  _value: [number, number] = [0, 0];
  _data: () => TableData;

  constructor(data: () => TableData) {
    this._data = data;
  }

  x(direction: '+' | '-', n: number) {
    return scrollTo(this._data(), direction, n, this._value, 0, (i) => col(this._data(), i).width);
  }

  y(direction: '+' | '-', n: number) {
    return scrollTo(this._data(), direction, n, this._value, 1, (i) => row(this._data(), i).height);
  }

  /**
  stepCol(n: number) {
    return step(this._data(), 0, n, this._value, (i) => col(this._data(), i).width);
  }

  stepRow(n: number) {
    return step(this._data(), 1, n, this._value, (i) => row(this._data(), i).height);
  }
  */
}
