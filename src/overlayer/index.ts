import { stylePrefix } from '../config';
import HElement, { h, CSSAttrs } from '../element';

const areaIndexMapHeaderIndexes = [
  [0, 2],
  [1, 2],
  [1, 3],
  [0, 3],
];

export default class Overlayer {
  _areas: HElement[];
  _headerAreas: HElement[];

  constructor(target: HElement) {
    this._areas = [
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
    ];
    this._headerAreas = [
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
      h('div', `${stylePrefix}-overlayer`),
    ];
    target.append(...this._areas, ...this._headerAreas);
  }

  translatex(value: number) {
    translate(this, [0, 3], 0, `translateX(${value}px)`);
  }

  translatey(value: number) {
    translate(this, [1, 2], 2, `translateY(${value}px)`);
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

  headerAreas(areaIndex: number): [HElement, HElement] {
    const [rowhi, colhi] = areaIndexMapHeaderIndexes[areaIndex];
    return [this.headerArea(rowhi), this.headerArea(colhi)];
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

function translate(ol: Overlayer, indexes: number[], headerIndex: number, translateCss: string) {
  [(indexes.map((it) => ol._areas[it]), ol._headerAreas[headerIndex])].forEach((it) =>
    it.css('transform', translateCss)
  );
}
