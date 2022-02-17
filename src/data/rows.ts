import { sum } from './helper';
import { Data, DataRow } from './type';

export type Rows = {
  get(index: number): DataRow;
  height(): number;
};

export function createRows({ rows, row }: Data): Rows {
  function get(index: number) {
    return (rows && rows[index]) || { height: row.height };
  }

  function height() {
    return sum(0, row.len, (i) => get(i).height);
  }

  return {
    get,
    height,
  };
}
