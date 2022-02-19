import { expr2xy, xy2expr } from 'table-render';
import { col, row, TableData } from './data';

function scrollTo(
  data: TableData,
  value: number,
  oldValue: [number, number],
  index: number,
  getValue: (index: number) => number
): [boolean, number, number] | undefined {
  if (!data.scroll) return;
  const indexes = expr2xy(data.scroll);
  let newValue = oldValue[index];
  let changed = false;
  if (value > oldValue[index]) {
    for (let i = indexes[index]; i < data.rows.len; i += 1) {
      if (newValue > value) break;
      newValue += getValue(i);
      indexes[index] = i + 1;
      changed = true;
    }
  } else {
    for (let i = indexes[index]; i > 0; i -= 1) {
      if (newValue < value) break;
      newValue -= getValue(i);
      indexes[index] = i - 1;
      changed = true;
    }
  }
  data.scroll = xy2expr(...indexes);
  oldValue[index] = value;
  return [changed, ...indexes];
}

function step(
  data: TableData,
  index: number,
  n: number,
  oldValue: [number, number],
  getValue: (index: number) => number
): number | undefined {
  if (!data.scroll) return;
  const indexes = expr2xy(data.scroll);
  const start = indexes[index];

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
  indexes[index] = end;
  data.scroll = xy2expr(...indexes);
  oldValue[index] = newValue;
  return indexes[index];
}

export default class Scroll {
  // [x, y]
  _value: [number, number] = [0, 0];
  _data: () => TableData;

  constructor(data: () => TableData) {
    this._data = data;
  }

  x(n: number) {
    return scrollTo(this._data(), n, this._value, 0, (i) => col(this._data(), i).width);
  }

  y(n: number) {
    return scrollTo(this._data(), n, this._value, 1, (i) => row(this._data(), i).height);
  }

  stepCol(n: number) {
    return step(this._data(), 0, n, this._value, (i) => col(this._data(), i).width);
  }

  stepRow(n: number) {
    return step(this._data(), 1, n, this._value, (i) => row(this._data(), i).height);
  }
}
