export type DataDefaultRow = {
  len: number;
  height: number;
  minHeight: number;
  indexHeight: number;
};
export type DataDefaultCol = {
  len: number;
  width: number;
  minWidth: number;
  indexWidth: number;
};

export type Align = 'left' | 'right' | 'center';
export type VerticalAlign = 'top' | 'bottom' | 'middle';
export type LineType = 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted';

export type DataStyle = {
  bgcolor: string;
  align: Align;
  valign: VerticalAlign;
  textwrap: boolean;
  underline: boolean;
  strikethrough: boolean;
  color: string;
  bold: boolean;
  italic: boolean;
  fontSize: number;
  fontName: string;
  rotate?: number;
  border?: {
    left: [LineType, string];
    top: [LineType, string];
    right: [LineType, string];
    bottom: [LineType, string];
  };
  padding?: [number, number];
};

export type DataStyles = DataStyle[];
export type DataMerges = string[];

export type DataRow = {
  height: number;
  hide?: boolean;
  style?: number;
};
export type DataRows = {
  [key: number]: DataRow;
};

export type DataCol = {
  width: number;
  hide?: boolean;
  style?: number;
};
export type DataCols = {
  [key: number]: DataCol;
};

export type DataCells = {
  [key: number]: {
    [key: number]: {
      style: number;
      type: string;
      text: string;
    };
  };
};

export type Data = {
  row: DataDefaultRow;
  col: DataDefaultCol;
  style: DataStyle;
  styles?: DataStyles;
  freeze?: string;
  scroll?: string;
  merges?: DataMerges;
  rows?: DataRows;
  cols?: DataCols;
  cells?: DataCells;
};
