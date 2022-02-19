import { expr2xy } from 'table-render';
import { Cell, CellStyle } from 'table-render/dist/types';
import { sum } from './helper';

export type DataRow = {
  height: number;
  hide?: boolean;
  style?: number;
};
export type DataRows = {
  len: number;
  [key: number]: DataRow;
};

export type DataCol = {
  width: number;
  hide?: boolean;
  style?: number;
};
export type DataCols = {
  len: number;
  [key: number]: DataCol;
};

export type DataCells = {
  [key: number]: {
    [key: number]: Cell;
  };
};

export type TableData = {
  rows: DataRows;
  cols: DataCols;
  rowHeight: number;
  colWidth: number;
  style: CellStyle;
  styles?: CellStyle[];
  freeze?: string;
  scroll?: string;
  merges?: string[];
  cells?: DataCells;
};

export function style({ styles }: TableData, index?: number) {
  if (!index) return undefined;
  return styles ? styles[index] : undefined;
}

export function col({ cols, colWidth }: TableData, index: number) {
  return (cols && cols[index]) || { width: colWidth };
}

export function colsWidth(data: TableData) {
  return sum(0, data.cols.len, (i) => col(data, i).width);
}

export function row({ rows, rowHeight }: TableData, index: number) {
  return (rows && rows[index]) || { height: rowHeight };
}

export function rowsHeight(data: TableData) {
  return sum(0, data.rows.len, (i) => row(data, i).height);
}

export function cell({ cells }: TableData, rowIndex: number, colIndex: number) {
  return cells ? cells[rowIndex][colIndex] : undefined;
}

export function defaultData(): TableData {
  return {
    rows: {
      len: 100,
    },
    cols: {
      len: 26,
    },
    rowHeight: 25,
    colWidth: 100,
    style: {
      fontName: 'Helvetica',
      fontSize: 10,
      color: '#333',
      bgcolor: '#fff',
      align: 'left',
      valign: 'middle',
      textwrap: false,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
    },
  };
}
