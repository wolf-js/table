import { Rect } from 'table-render/dist/types';
import { Range } from 'table-render';
import { stylePrefix } from '../config';
import HElement, { h } from '../element';

const borderWidth = 2;

type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
  _ranges: Range[] = [];
  _headerRanges: Range[] = [];
  _startRange: Range | null = null;
  _placement: Placement = 'body';

  _header = { width: 0, height: 0 };

  _areas: HElement[] = [];
  _headerAreas: HElement[] = [];
  _: HElement;
  _corner: HElement;

  _targets: HElement[] = [];
  _targetChildren: Node[][] = [];

  constructor(headerWidth: number, headerHeight: number) {
    this._corner = h('div', 'corner');
    this._ = h('div', `${stylePrefix}-selector`).append(this._corner);
    this._header.width = headerWidth;
    this._header.height = headerHeight;
  }

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  addRange(range: Range, clear: boolean = true) {
    if (clear) this.clearRanges();
    this._areas.push(h('div', `${stylePrefix}-selector-area`));
    this._headerAreas.push(
      h('div', `${stylePrefix}-selector-area row-header`),
      h('div', `${stylePrefix}-selector-area col-header`)
    );
    this._ranges.push(range);
    this._startRange = range;

    updateHeaderRanges(this, range);
    return this;
  }

  unionRange(row: number, col: number) {
    const { _ranges, _startRange } = this;
    if (_startRange) {
      const newRange = _startRange.union(Range.create(row, col));
      _ranges.splice(-1, 1, newRange);
      updateHeaderRanges(this, newRange);
    }
    return this;
  }

  clearRanges() {
    [this._headerAreas, this._areas, this._ranges, this._headerRanges].forEach((it) => (it.length = 0));
    return this;
  }

  rangeRects(rangeRect: (r: Range) => Rect | null, isHeader: boolean = false) {
    if (isHeader) return this.headerRangeRects(rangeRect);
    const { _ranges, _, _corner } = this;
    _ranges.forEach((range, index) => {
      const rr = rangeRect(range);
      const area = this._areas[index];
      if (rr) {
        const { x, y, width, height } = rr;
        // area
        area
          .css({
            left: x + borderWidth,
            top: y + borderWidth,
            width: width - borderWidth * 2,
            height: height - borderWidth * 2,
          })
          .show();
        if (index === _ranges.length - 1) {
          _.css({
            left: x,
            top: y,
            width: width - borderWidth * 2,
            height: height - borderWidth * 2,
          }).show();
        }
        _corner.show(_ranges.length === 1 && this._placement === 'body');
      } else {
        _.hide();
        area.hide();
      }
    });
    return this;
  }

  headerRangeRects(rangeRect: (r: Range) => Rect | null) {
    const { _headerRanges } = this;
    _headerRanges.forEach((range, index) => {
      const rr = rangeRect(range);
      const area = this._headerAreas[index];
      if (rr) {
        const { x, y, width, height } = rr;
        area.css({ left: x, top: y, width, height }).show();
      } else {
        area.hide();
      }
    });
    return this;
  }

  addTarget(target: HElement, isHeader: boolean = false) {
    let areas: Node[];
    if (isHeader) areas = clones(this._headerAreas);
    else areas = [this._.cloneNode(), ...clones(this._areas)];
    target.append(...areas);
    this._targetChildren.push(areas);
    this._targets.push(target);
    return this;
  }

  clearTargets() {
    if (this._targets && this._targets.length > 0) {
      this._targets.forEach((it, index) => it.remove(...this._targetChildren[index]));
      [this._targetChildren, this._targets].forEach((it) => (it.length = 0));
    }
    return this;
  }
}

function clones(eles: HElement[]) {
  return eles.map((it) => it.cloneNode());
}

function headerRanges(range: Range) {}

function updateHeaderRanges(s: Selector, range: Range) {
  const { _headerRanges } = s;
  const { startRow, startCol, endRow, endCol } = range;
  const ranges = [Range.create(startRow, 0, endRow, 0), Range.create(0, startCol, 0, endCol)];
  const merged = [false, false];
  _headerRanges.forEach((r, index) => {
    if (r.intersects(ranges[0])) {
      _headerRanges.splice(index, 1, r.union(ranges[0]));
      merged[0] = true;
    } else if (r.intersects(ranges[1])) {
      _headerRanges.splice(index, 1, r.union(ranges[1]));
      merged[1] = true;
    }
  });
  merged.forEach((it, i) => {
    if (!it) _headerRanges.push(ranges[i]);
  });
}
