import { Data, DataCol } from './type';
import { sum } from './helper';

export type Cols = {
  get(index: number): DataCol;
  width(): number;
};

export function createCols({ cols, col }: Data): Cols {
  function get(index: number) {
    return (cols && cols[index]) || { width: col.width };
  }

  function width() {
    return sum(0, col.len, (i) => get(i).width);
  }

  return {
    get,
    width,
  };
}
