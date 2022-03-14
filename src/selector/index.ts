import { Rect } from 'table-render/dist/types';
import { Range } from 'table-render';
import { stylePrefix } from '../config';
import HElement, { h } from '../element';
import { arrayBuffer } from 'stream/consumers';

const borderWidth = 2;

type Placement = 'all' | 'row-header' | 'col-header' | 'body';
export default class Selector {
  _ranges: Range[] = [];
  _startRange: Range | null = null;
  _placement: Placement = 'body';

  _areas: HElement[] = [];
  _: HElement;
  _corner: HElement;

  _targets: HElement[] = [];
  _targetChildren: Node[][] = [];

  constructor() {
    this._corner = h('div', 'corner');
    this._ = h('div', `${stylePrefix}-selector`).append(this._corner);
  }

  placement(value: Placement) {
    this._placement = value;
    return this;
  }

  addRange(range: Range, clear: boolean = true) {
    if (clear) this.clearRanges();
    this._areas.push(h('div', `${stylePrefix}-selector-area`));
    this._ranges.push(range);
    this._startRange = range;
    return this;
  }

  unionRange(row: number, col: number) {
    const { _ranges, _startRange } = this;
    if (_startRange) _ranges.splice(-1, 1, _startRange.union(Range.create(row, col)));
    return this;
  }

  clearRanges() {
    this._areas.length = 0;
    this._ranges.length = 0;
    return this;
  }

  rangeRects(rangeRect: (r: Range) => Rect | null) {
    const { _ranges, _, _corner } = this;
    _ranges.forEach((range, index) => {
      const rr = rangeRect(range);
      const area = this._areas[index];
      if (rr) {
        const { x, y, width, height } = rr;
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

  addTarget(target: HElement) {
    const cloneNodes = [this._.cloneNode(), ...this._areas.map((it) => it.cloneNode())];
    target.append(...cloneNodes);
    this._targetChildren.push(cloneNodes);
    this._targets.push(target);
    return this;
  }

  clearTargets() {
    if (this._targets && this._targets.length > 0) {
      this._targets.forEach((it, index) => it.remove(...this._targetChildren[index]));
      this._targetChildren.length = 0;
      this._targets.length = 0;
    }
    return this;
  }
}
