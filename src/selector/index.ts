import { Range, Rect } from 'table-render';
import { stylePrefix, borderWidth } from '../config';
import HElement, { h } from '../element';

type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
  ranges: Range[] = [];
  rowHeaderRanges: Range[] = [];
  colHeaderRanges: Range[] = [];

  _startRange: Range | null = null;
  _placement: Placement = 'body';
  _header: { width: number; height: number };

  _areas: HElement[] = [];
  _rowHeaderAreas: HElement[] = [];
  _colHeaderAreas: HElement[] = [];
  _: HElement | null = null;
  _corner: HElement;

  _targets: HElement[] = [];
  _targetChildren: Node[][] = [];

  constructor(header: { width: number; height: number }) {
    this._corner = h('div', 'corner');
    this._header = header;
  }

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  addRange(row: number, col: number, clear: boolean = true) {
    const range = Range.create(row, col);
    if (clear) this.clearRanges();
    this.ranges.push(range);
    this._startRange = range;

    updateHeaderRanges(this, range);
    return this;
  }

  unionRange(row: number, col: number) {
    const range = Range.create(row, col);
    const { ranges, _startRange } = this;
    if (_startRange) {
      const newRange = _startRange.union(range);
      ranges.splice(-1, 1, newRange);
      updateHeaderRanges(this, newRange);
    }
    return this;
  }

  clearRanges() {
    [this.ranges, this.rowHeaderRanges, this.colHeaderRanges].forEach((it) => (it.length = 0));
    return this;
  }

  addAreaRect(rangeIndex: number, { x, y, width, height }: Rect) {
    this._areas.push(
      h('div', `${stylePrefix}-selector-area`)
        .css({
          left: x + borderWidth,
          top: y + borderWidth,
          width: width - borderWidth * 2,
          height: height - borderWidth * 2,
        })
        .show()
    );

    const last = rangeIndex === this.ranges.length - 1;
    if (last) {
      this._ = h('div', `${stylePrefix}-selector`)
        .css({
          left: x,
          top: y,
          width: width - borderWidth * 2,
          height: height - borderWidth * 2,
        })
        .show();

      if (this._placement === 'body') this._.append(this._corner);
    }
    return this;
  }

  addRowHeaderAreaRect({ x, y, width, height }: Rect) {
    this._rowHeaderAreas.push(
      h('div', `${stylePrefix}-selector-area row-header`).css({ left: x, top: y, width, height }).show()
    );
    return this;
  }

  addColHeaderAreaRect({ x, y, width, height }: Rect) {
    this._colHeaderAreas.push(
      h('div', `${stylePrefix}-selector-area col-header`).css({ left: x, top: y, width, height }).show()
    );
    return this;
  }

  addTarget(target: HElement) {
    let areas: any[];
    areas = [...this._areas, ...this._rowHeaderAreas, ...this._colHeaderAreas];
    if (this._areas.length > 0 && this._) areas.push(this._);
    target.append(...areas);
    this._targetChildren.push(areas);
    this._targets.push(target);

    // clear areas
    this.clearAreas();
    return this;
  }

  clearTargets() {
    if (this._targets && this._targets.length > 0) {
      this._targets.forEach((it, index) => it.remove(...this._targetChildren[index]));
      [this._targetChildren, this._targets].forEach((it) => (it.length = 0));
      this.clearAreas();
    }
    return this;
  }

  clearAreas() {
    [this._rowHeaderAreas, this._colHeaderAreas, this._areas].forEach((it) => (it.length = 0));
    this._ = null;
  }
}

function updateHeaderRanges(s: Selector, range: Range) {
  const { startRow, startCol, endRow, endCol } = range;

  const updater = (ranges: Range[], r: Range) => {
    let merged = false;
    for (let j = 0; j < ranges.length; j += 1) {
      const hr = ranges[j];
      if (hr.intersects(r)) {
        ranges.splice(j, 1, hr.union(r));
        merged = true;
        break;
      }
    }
    if (!merged) {
      ranges.push(r);
    }
  };

  if (startRow > 0 || endRow > 0) {
    updater(s.rowHeaderRanges, Range.create(startRow, 0, endRow, 0));
  }
  if (startCol > 0 || endCol > 0) {
    updater(s.colHeaderRanges, Range.create(0, startCol, 0, endCol));
  }
}
