import { Rect, ViewCell } from 'table-render/dist/types';
import { stylePrefix } from '../config';
import Element, { h } from '../element';
import { mouseMoveup } from '../event';

export type ResizerType = 'row' | 'col';

export default class Resizer {
  _: Element;
  _hover: Element;
  _line: Element;

  _type: ResizerType;
  _minValue: number;
  _lineLength: () => number;
  _cell: ViewCell | null = null;
  _change: (value: number, cell: ViewCell) => void;

  constructor(
    type: ResizerType,
    minValue: number,
    lineLength: () => number,
    change: (value: number, cell: ViewCell) => void = () => {}
  ) {
    this._type = type;
    this._minValue = minValue;
    this._lineLength = lineLength;
    this._change = change;

    this._ = h('div', `${stylePrefix}-resizer ${type}`).append(
      (this._hover = h('div', 'hover').on('mousedown.stop', (evt) => mousedownHandler(this, evt))),
      (this._line = h('div', 'line'))
    );
  }

  show(cell: ViewCell) {
    this._cell = cell;
    const { _type } = this;
    const { x, y, width, height } = cell;

    this._.css('left', `${_type === 'row' ? x : x + width - 5}px`)
      .css('top', `${_type === 'row' ? y + height - 5 : y}px`)
      .show();

    const key = _type === 'row' ? 'width' : 'height';
    this._hover.css(key, `${cell[key]}px`);
    this._line.css(key, `${this._lineLength()}px`);
  }

  hide() {
    this._.hide();
  }
}

function mousedownHandler(resizer: Resizer, evt: any) {
  let prevEvent = evt;
  const { _type, _cell, _minValue, _, _line, _change } = resizer;
  let distance = 0;

  _line.show();
  mouseMoveup(
    window,
    (e) => {
      if (evt !== null && e.buttons === 1 && _cell) {
        if (_type === 'row') {
          distance += e.movementY;
          if (distance + _cell.height >= _minValue) {
            _.css('top', `${_cell.y + _cell.height + distance}px`);
          }
        } else {
          distance += e.movementX;
          if (distance + _cell.width >= _minValue) {
            _.css('left', `${_cell.x + _cell.width + distance}px`);
          }
        }
      }
      prevEvent = e;
    },
    () => {
      prevEvent = null;
      _line.hide();
      _.hide();
      if (_cell && distance > 0) {
        _change(distance, _cell);
      }
    }
  );
}
