import { expr2xy, xy2expr } from 'table-render';
import { Cols } from './cols';
import { Rows } from './rows';
import { Data, View } from './type';

function scrollTo(
  data: Data,
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
    for (let i = indexes[index]; i < data.row.len; i += 1) {
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
  data: Data,
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
  if (end > data.row.len) end = data.row.len;

  let newValue = oldValue[index];
  if (n > 0) {
    for (let i = start; i < end; i += 1) {
      if (i >= data.row.len) break;
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

export type Scroll = {
  get(): { x: number; y: number; width: number; height: number; contentWidth: number; contentHeight: number };
  x(n: number): [boolean, number, number] | undefined; // [changed, colIndex, rowIndex]
  y(n: number): [boolean, number, number] | undefined; // [changed, colIndex, rowIndex]
  stepRow(n: number): number | undefined;
  stepCol(n: number): number | undefined;
};

export function createScroll(data: Data, view: View, rows: Rows, cols: Cols): Scroll {
  // [x, y]
  const oldValue: [number, number] = [0, 0];

  function x(n: number) {
    return scrollTo(data, n, oldValue, 0, (i) => cols.get(i).width);
  }

  function y(n: number) {
    return scrollTo(data, n, oldValue, 1, (i) => rows.get(i).height);
  }

  function stepRow(n: number) {
    return step(data, 1, n, oldValue, (i) => rows.get(i).height);
  }

  function stepCol(n: number) {
    return step(data, 0, n, oldValue, (i) => cols.get(i).width);
  }

  function get() {
    const width = view.width() - data.col.indexWidth;
    const height = view.height() - data.row.indexHeight;
    const contentWidth = cols.width();
    const contentHeight = rows.height();
    const [x, y] = oldValue;
    return {
      x,
      y,
      width,
      height,
      contentWidth,
      contentHeight,
    };
  }

  return {
    get,
    x,
    y,
    stepCol,
    stepRow,
  };
}
