import { Rect } from 'table-render/dist/types';
import { stylePrefix } from '../config';
import HElement, { h, CSSAttrs } from '../element';

export default class Overlayer {
  _areas: HElement[];
  _headerAreas: HElement[];

  constructor(target: HElement) {
    this._areas = [
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
    ];
    this._headerAreas = [
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
      h('div', `${stylePrefix}-overlayer-area`),
    ];
    target.append(...this._areas, ...this._headerAreas);
  }

  area(index: number): HElement;
  area(index: number, cssAttrs: CSSAttrs): Overlayer;
  area(index: number, cssAttrs?: CSSAttrs): any {
    if (cssAttrs) {
      this._areas[index].css(cssAttrs);
      return this;
    }
    return this._areas[index];
  }

  headerArea(index: number): HElement;
  headerArea(index: number, cssAttrs: CSSAttrs): Overlayer;
  headerArea(index: number, cssAttrs?: CSSAttrs): any {
    if (cssAttrs) {
      this._headerAreas[index].css(cssAttrs);
    }
    return this._headerAreas[index];
  }
}
