import './style.index.less';
import TableRender, { stringAt, Range } from 'table-render';
import { CellStyle, ColHeader, RowHeader } from 'table-render/dist/types';
import { defaultData, TableData, row, col, cell, colsWidth, rowsHeight, rowHeight, colWidth } from './data';
import HElement, { h } from './element';
import Scroll from './scroll';
import Scrollbar from './scrollbar';
import Resizer from './resizer';
import { bind, unbind } from './event';
import Selector from './selector';
import Areas from './areas';
import Overlayer from './overlayer';
import { stylePrefix } from './config';

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
  selectable?: boolean;
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

  _container: HElement;

  _data: TableData;

  _render: TableRender;

  // scrollbar
  _vScrollbar: Scrollbar | null = null;
  _hScrollbar: Scrollbar | null = null;

  // resizer
  _rowResizer: Resizer | null = null;
  _colResizer: Resizer | null = null;

  _selector: Selector | null = null;
  _overlayer: Overlayer;

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
    this._container = h(container).css({ position: 'relative', height: height(), width: width() });
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

    this._overlayer = new Overlayer(this._container);

    // scroll
    if (options?.scrollable) {
      // init scrollbars
      tableInitScrollbars(this);
    }

    if (options?.resizable) {
      // init resizers
      tableInitResizers(this);
    }

    if (options?.selectable) {
      this._selector = new Selector();
    }

    // canvas bind wheel
    tableCanvasBindWheel(this, hcanvas);
    // canvas bind mousemove
    tableCanvasBindMousemove(this, hcanvas);
    // canvas bind mousedown
    tableCanvasBindMousedown(this, hcanvas);
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

  resize() {
    this._container.css({ height: this._height(), width: this._width() });
    tableResizeScrollbars(this);
  }

  freeze(ref: string) {
    if (ref) this._data.freeze = ref;
    return this;
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

  colsWidth(min: number, max: number) {
    return colsWidth(this._data, min, max);
  }

  rowsHeight(min: number, max: number) {
    return rowsHeight(this._data, min, max);
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

    // viewport
    const { _render, _overlayer } = this;
    const { viewport } = _render;
    if (viewport) {
      viewport.areas.forEach(({ x, y, width, height }, index) => {
        _overlayer.area(index, { left: x, top: y, width, height });
      });
      viewport.headerAreas.forEach(({ x, y, width, height }, index) => {
        _overlayer.headerArea(index, { left: x, top: y, width, height });
      });
    }
    tableResetSelector(this);
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

function tableResetSelector(t: Table) {
  const { _selector, _overlayer, _container, _rowHeader, _colHeader } = t;
  if (_selector) {
    const { _placement } = _selector;
    _selector.clearTargets();
    if (_placement === 'body') {
      const { viewport } = t._render;
      if (viewport) {
        viewport.areas.forEach((area, index) => {
          let insects = false;
          _selector.rangeRects((r) => {
            if (area.range.intersects(r)) {
              insects = true;
              return area.rect(r);
            }
            return null;
          });
          if (insects) {
            _selector.addTarget(_overlayer.area(index));
          }
        });
      }
    } else {
      const x = _rowHeader.width;
      const y = _colHeader.height;
      _selector
        .rangeRects((it) => {
          const rect = { x, y, width: t._width() - x, height: t._height() - y };
          if (_placement === 'row-header') {
            rect.y = y + t.rowsHeight(0, it.startRow);
            rect.height = t.rowsHeight(it.startRow, it.endRow + 1);
          } else if (_placement === 'col-header') {
            rect.x = x + t.colsWidth(0, it.startCol);
            rect.width = t.colsWidth(it.startCol, it.endCol + 1);
          }
          return rect;
        })
        .addTarget(_container);
    }
  }
}

function tableInitScrollbars(t: Table) {
  const scroll = new Scroll(() => t._data);
  // scrollbar
  t._vScrollbar = new Scrollbar('vertical', t._container).change((direction, value) => {
    if (scroll.y(direction, value)) t.render();
  });

  t._hScrollbar = new Scrollbar('horizontal', t._container).change((direction, value) => {
    if (scroll.x(direction, value)) t.render();
  });
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
    t._container,
    t._minRowHeight,
    () => t._width(),
    (value, { row, height }) => {
      t.rowHeight(row, height + value).render();
    }
  );
  t._colResizer = new Resizer(
    'col',
    t._container,
    t._minColWidth,
    () => t._height(),
    (value, { col, width }) => {
      t.colWidth(col, width + value).render();
    }
  );
}

function tableCanvasBindMousedown(t: Table, hcanvas: HElement) {
  hcanvas.on('mousedown', (evt) => {
    const { _selector, _render } = t;
    const { viewport } = _render;
    if (_selector && viewport) {
      const { offsetX, offsetY, ctrlKey, metaKey, shiftKey } = evt;
      // console.log(':::', ctrlKey, metaKey);
      const vcell = viewport.cellAt(offsetX, offsetY);
      if (vcell) {
        const { placement, row, col } = vcell;
        if (shiftKey) {
          _selector.unionRange(row, col);
        } else {
          _selector.placement(placement).addRange(Range.create(row, col), !(metaKey || ctrlKey));
        }
        tableResetSelector(t);

        if (placement !== 'all') {
          const { left, top } = hcanvas.rect();
          // console.log('first.select:', select);
          const moveHandler = (e: any) => {
            let [x1, y1] = [0, 0];
            if (e.x > 0) x1 = e.x - left;
            if (e.y > 0) y1 = e.y - top;
            if (placement === 'row-header') x1 = 1;
            if (placement === 'col-header') y1 = 1;

            const c1 = viewport.cellAt(x1, y1);
            if (c1) {
              _selector.unionRange(c1.row, c1.col);
              tableResetSelector(t);
            }
          };
          const upHandler = () => {
            unbind(window, 'mousemove', moveHandler);
            unbind(window, 'mouseup', upHandler);
          };
          bind(window, 'mousemove', moveHandler);
          bind(window, 'mouseup', upHandler);
        }
      }
    }
  });
}

function tableCanvasBindMousemove(t: Table, hcanvas: HElement) {
  hcanvas.on('mousemove', (evt) => {
    const { _rowResizer, _colResizer, _render } = t;
    const { viewport } = _render;
    const { buttons, offsetX, offsetY } = evt;
    // press the mouse left button
    if (viewport && buttons === 0) {
      const { _rowHeader, _colHeader } = t;
      if (_rowResizer && _rowHeader.width > 0) {
        if (offsetX < _rowHeader.width && offsetY > _colHeader.height) {
          const cell = viewport.cellAt(offsetX, offsetY);
          if (cell) _rowResizer.show(cell);
        } else {
          _rowResizer.hide();
        }
      }
      if (_colResizer && _colHeader.height > 0) {
        // console.log('col-resizer:');
        if (offsetY < _colHeader.height && offsetX > _rowHeader.width) {
          const cell = viewport.cellAt(offsetX, offsetY);
          // console.log('cell::', cell);
          if (cell) _colResizer.show(cell);
        } else {
          _colResizer.hide();
        }
      }
    }
  });
}

function tableCanvasBindWheel(t: Table, hcanvas: HElement) {
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
          _vScrollbar.scroll(nvalue);
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
