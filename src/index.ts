import './style.index.less';
import TableRender from 'table-render';
import { CellStyle, ColHeader, RowHeader } from 'table-render/dist/types';
import { defaultData, TableData, row, col, cell, colsWidth, rowsHeight } from './data';
import Element, { h } from './element';
import Scroll from './scroll';
import Scrollbar from './scrollbar';

export type TableOptions = {
  rowHeight?: number;
  colWidth?: number;
  rows?: number;
  cols?: number;
  cellStyle?: Partial<CellStyle>;
  scrollable?: boolean;
  resizable?: boolean;
};

export default class Table {
  // for render
  _colHeader: ColHeader | undefined;
  // for render
  _rowHeader: RowHeader | undefined;

  _width: () => number;

  _height: () => number;

  _container: Element;

  _data: TableData;

  _render: TableRender;

  // scrollbar
  _vScrollbar: Scrollbar | null = null;
  _hScrollbar: Scrollbar | null = null;

  constructor(
    element: HTMLElement | string,
    width: () => number,
    height: () => number,
    options?: TableOptions
  ) {
    this._width = width;
    this._height = height;
    const container: HTMLElement | null =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (container === null) throw new Error('first argument error');
    this._container = h(container)
      .css('position', 'relative')
      .css('height', `${height()}px`)
      .css('width', `${width()}px`);
    this._data = defaultData();

    // update default data
    if (options) {
      if (options.cols) this._data.cols.len = options.cols;
      if (options.rows) this._data.rows.len = options.rows;
      if (options.rowHeight) this._data.rowHeight = options.rowHeight;
      if (options.colWidth) this._data.colWidth = options.colWidth;
      if (options.cellStyle) Object.assign(this._data.style, options.cellStyle);
    }

    const canvasElement = document.createElement('canvas');
    this._render = new TableRender(canvasElement, width(), height());

    this._container.append(canvasElement);

    if (options?.scrollable) {
      const scroll = new Scroll(() => this._data);
      // scrollbar
      this._vScrollbar = new Scrollbar('vertical').change((direction, value) => {
        if (scroll.y(direction, value)) this.render();
      });

      this._hScrollbar = new Scrollbar('horizontal').change((direction, value) => {
        if (scroll.x(direction, value)) this.render();
      });
      this._container.append(this._vScrollbar._, this._hScrollbar._);
      tableResizeScrollbars(this);
    }
  }

  colHeader(v: ColHeader) {
    this._colHeader = v;
    return this;
  }

  rowHeader(v: RowHeader) {
    this._rowHeader = v;
    return this;
  }

  data(): TableData;
  data(data: TableData): Table;
  data(data?: any): any {
    if (data) {
      this._data = data;
      tableResizeScrollbars(this);
      return this;
    } else {
      return this._data;
    }
  }

  render() {
    this._render
      .colHeader(this._colHeader)
      .rowHeader(this._rowHeader)
      .scrollRows(this._data.scroll[1])
      .scrollCols(this._data.scroll[0])
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

// methods ---- start ----

function tableResizeScrollbars(t: Table) {
  console.log('content.size: ', rowsHeight(t._data), colsWidth(t._data));
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), rowsHeight(t._data) + t._data.rowHeight);
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width() - 15, colsWidth(t._data));
  }
}

// methods ---- end ------

export function createTable(
  element: HTMLElement | string,
  width: () => number,
  height: () => number,
  options?: TableOptions
): Table {
  return new Table(element, width, height, options);
}
