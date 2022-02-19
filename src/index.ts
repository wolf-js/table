import TableRender from 'table-render';
import { CellStyle, ColHeader, RowHeader } from 'table-render/dist/types';
import { defaultData, TableData, row, col, cell } from './data';
import Scroll from './scroll';
import Scrollbar from './scrollbar';

export default class Table {
  // for render
  _colHeader: ColHeader | undefined;
  // for render
  _rowHeader: RowHeader | undefined;

  _width: () => number;

  _height: () => number;

  _container: HTMLElement;

  _scrollable: boolean = false;

  _resizable: boolean = false;

  _data: TableData;

  _render: TableRender;

  _scroll: Scroll;
  // scrollbar
  _verticalScrollbar: Scrollbar;
  _horizontalScrollbar: Scrollbar;

  constructor(element: HTMLElement | string, width: () => number, height: () => number) {
    this._width = width;
    this._height = height;
    const container: HTMLElement | null =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (container === null) throw new Error('first argument error');
    this._container = container;
    this._data = defaultData();

    const canvasElement = document.createElement('canvas');
    this._render = TableRender.create(canvasElement, width(), height());

    container.appendChild(canvasElement);

    this._scroll = new Scroll(() => this._data);

    // scrollbar
    this._verticalScrollbar = new Scrollbar('vertical').change((value) => {
      this._scroll.y(value);
      this.render();
    });

    this._horizontalScrollbar = new Scrollbar('horizontal').change((value) => {
      this._scroll.x(value);
      this.render();
    });
  }

  colHeader(v: ColHeader) {
    this._colHeader = v;
    return this;
  }

  rowHeader(v: RowHeader) {
    this._rowHeader = v;
    return this;
  }

  // default row height
  rowHeight(v: number) {
    this._data.rowHeight = v;
    return this;
  }

  // default col width
  colWidth(v: number) {
    this._data.colWidth = v;
    return this;
  }

  // default len of rows
  rowsLen(v: number) {
    this._data.rows.len = v;
    return this;
  }

  // default len of cols
  colsLen(v: number) {
    this._data.cols.len = v;
    return this;
  }

  // default cell style
  cellStyle(v: Partial<CellStyle>) {
    Object.assign(this._data.style, v || {});
    return this;
  }

  data(): TableData;
  data(data: TableData): Table;
  data(data?: any): any {
    if (data) {
      this._data = data;
      return this;
    } else {
      return this._data;
    }
  }

  scrollable(v: boolean) {
    this._scrollable = v;
    return this;
  }

  resizable(v: boolean) {
    this._resizable = v;
    return this;
  }

  render() {
    this._render
      .colHeader(this._colHeader)
      .rowHeader(this._rowHeader)
      .merges(this._data.merges)
      .freeze(this._data.freeze)
      .styles(this._data.styles)
      .rows(this._data.rows.len)
      .cols(this._data.cols.len)
      .row((index) => row(this._data, index))
      .col((index) => col(this._data, index))
      .cell((r, c) => cell(this._data, r, c))
      .render();
  }
}
