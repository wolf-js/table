import './style.index.less';
import TableRender, { stringAt } from 'table-render';
import { CellStyle, ColHeader, RowHeader } from 'table-render/dist/types';
import { defaultData, TableData, row, col, cell, colsWidth, rowsHeight, rowHeight, colWidth } from './data';
import Element, { h } from './element';
import Scroll from './scroll';
import Scrollbar from './scrollbar';
import Resizer from './resizer';

export type TableOptions = {
  rowHeight?: number;
  colWidth?: number;
  minRowHeight?: number;
  minColWidth?: number;
  rows?: number;
  cols?: number;
  cellStyle?: Partial<CellStyle>;
  rowHeader?: Partial<RowHeader>;
  colHeader?: Partial<ColHeader>;
  scrollable?: boolean;
  resizable?: boolean;
};

export default class Table {
  // for render
  _colHeader: ColHeader = {
    height: 25,
    rows: 1,
    cell(rowIndex, colIndex) {
      return stringAt(colIndex);
    },
  };
  // for render
  _rowHeader: RowHeader = {
    width: 60,
    cols: 1,
    cell(rowIndex, colIndex) {
      return rowIndex + 1;
    },
  };

  _minRowHeight: number = 25;

  _minColWidth: number = 60;

  _width: () => number;

  _height: () => number;

  _container: Element;

  _data: TableData;

  _render: TableRender;

  // scrollbar
  _vScrollbar: Scrollbar | null = null;
  _hScrollbar: Scrollbar | null = null;

  // resizer
  _rowResizer: Resizer | null = null;
  _colResizer: Resizer | null = null;

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
      const { cols, rows, rowHeight, colWidth, minRowHeight, minColWidth, cellStyle, rowHeader, colHeader } =
        options;
      const { _data } = this;
      if (minRowHeight) this._minRowHeight = minRowHeight;
      if (minColWidth) this._minColWidth = minColWidth;
      if (cols) _data.cols.len = cols;
      if (rows) _data.rows.len = rows;
      if (rowHeight) _data.rowHeight = rowHeight;
      if (colWidth) _data.colWidth = colWidth;
      if (cellStyle) Object.assign(_data.style, cellStyle);
      if (rowHeader) Object.assign(this._rowHeader, rowHeader);
      if (colHeader) Object.assign(this._colHeader, colHeader);
    }

    const canvasElement = document.createElement('canvas');
    const hcanvas = h(canvasElement);
    this._container.append(canvasElement);
    this._render = new TableRender(canvasElement, width(), height());

    // canvas bind wheel
    tableCanvasBindWheel(this, hcanvas);
    // canvas bind mousemove
    tableCanvasBindMousemove(this, hcanvas);

    // scroll
    if (options?.scrollable) {
      // init scrollbars
      tableInitScrollbars(this);
    }

    if (options?.resizable) {
      // init resizers
      tableInitResizers(this);
    }
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

  rowHeight(index: number, value: number) {
    rowHeight(this._data, index, value);
    tableResizeScrollbars(this);
    return this;
  }

  colWidth(index: number, value: number) {
    colWidth(this._data, index, value);
    tableResizeScrollbars(this);
    return this;
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

  static create(
    element: HTMLElement | string,
    width: () => number,
    height: () => number,
    options?: TableOptions
  ): Table {
    return new Table(element, width, height, options);
  }
}

// methods ---- start ----

function tableInitScrollbars(t: Table) {
  const scroll = new Scroll(() => t._data);
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical').change((direction, value) => {
    if (scroll.y(direction, value)) t.render();
  });

  t._hScrollbar = new Scrollbar('horizontal').change((direction, value) => {
    if (scroll.x(direction, value)) t.render();
  });
  t._container.append(t._vScrollbar._, t._hScrollbar._);
  tableResizeScrollbars(t);
}

function tableResizeScrollbars(t: Table) {
  // console.log('content.size: ', rowsHeight(t._data), colsWidth(t._data));
  if (t._vScrollbar) {
    t._vScrollbar.resize(t._height(), rowsHeight(t._data) + t._colHeader.height);
  }
  if (t._hScrollbar) {
    t._hScrollbar.resize(t._width() - 15, colsWidth(t._data) + t._rowHeader.width);
  }
}

function tableInitResizers(t: Table) {
  t._rowResizer = new Resizer(
    'row',
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
    }
  );
  t._colResizer = new Resizer(
    'col',
    t._minColWidth,
    () => t._height(),
    (value, { col, width }) => {
      t.colWidth(col, width + value).render();
    }
  );
  t._container.append(t._rowResizer._, t._colResizer._);
}

function tableCanvasBindMousemove(t: Table, hcanvas: Element) {
  hcanvas.on('mousemove', (evt) => {
    const { _rowResizer, _colResizer, _render } = t;
    const { buttons, offsetX, offsetY } = evt;
    // press the mouse left button
    if (buttons === 0) {
      const { _rowHeader, _colHeader } = t;
      if (_rowResizer && _rowHeader.width > 0) {
        // console.log('row-resizer:');
        if (offsetX < _rowHeader.width) {
          const cell = _render.cellAt(offsetX, offsetY);
          if (cell && cell[0] === 'row-header') _rowResizer.show(cell[1]);
        } else {
          _rowResizer.hide();
        }
      }
      if (_colResizer && _colHeader.height > 0) {
        // console.log('col-resizer:');
        if (offsetY < _colHeader.height) {
          const cell = _render.cellAt(offsetX, offsetY);
          // console.log('cell::', cell);
          if (cell && cell[0] === 'col-header') _colResizer.show(cell[1]);
        } else {
          _colResizer.hide();
        }
      }
    }
  });
}

function tableCanvasBindWheel(t: Table, hcanvas: Element) {
  hcanvas.on('wheel.prevent', (evt) => {
    const { deltaX, deltaY } = evt;
    const { _hScrollbar, _vScrollbar } = t;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (_hScrollbar) {
        const nvalue = _hScrollbar.value + deltaX;
        if (_hScrollbar.test(nvalue)) {
          _hScrollbar.scroll(nvalue);
        }
      }
    } else {
      if (_vScrollbar) {
        const nvalue = _vScrollbar.value + deltaY;
        if (_vScrollbar.test(nvalue)) {
          _vScrollbar?.scroll(nvalue);
        }
      }
    }
  });
}

// methods ---- end ------

declare global {
  interface Window {
    wolf: any;
  }
}

if (window) {
  window.wolf ||= {};
  window.wolf.table = Table.create;
}
