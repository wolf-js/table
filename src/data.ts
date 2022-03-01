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
  scroll: [number, number]; // cols, rows
  style: CellStyle;
  styles?: CellStyle[];
  freeze?: string;
  merges?: string[];
  cells?: DataCells;
};

export function style({ styles }: TableData, index?: number) {
  if (!index) return undefined;
  return styles?.[index];
}

export function col(data: TableData, index: number) {
  return data.cols[index] || { width: data.colWidth };
}

export function colWidth(data: TableData, index: number, value: number) {
  if (value !== data.colWidth) {
    if (data.cols[index]) data.cols[index].width = value;
    else data.cols[index] = { width: value };
  }
}

export function colsWidth(data: TableData) {
  return sum(0, data.cols.len, (i) => col(data, i).width);
}

export function row(data: TableData, index: number) {
  return data.rows[index] || { height: data.rowHeight };
}

export function rowHeight(data: TableData, index: number, value: number) {
  if (value !== data.rowHeight) {
    if (data.rows[index]) data.rows[index].height = value;
    else data.rows[index] = { height: value };
  }
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
    scroll: [0, 0],
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
