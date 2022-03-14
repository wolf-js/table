import { stylePrefix } from '../config';
import HElement, { h } from '../element';

export type ScrollbarChanger = ((direction: '+' | '-', value: number, event: Event) => void) | null;

const typeCssKeys = { vertical: 'height', horizontal: 'width' };

export default class Scrollbar {
  _: HElement;
  _content: HElement;

  _value: number = 0;

  _maxValue: number = 0;

  _type: 'vertical' | 'horizontal';

  _change: ScrollbarChanger = null;

  constructor(type: 'vertical' | 'horizontal', target: HElement) {
    this._type = type;
    this._content = h('div', 'content');
    this._ = h('div', `${stylePrefix}-scrollbar ${type}`)
      .append(this._content)
      .on('scroll.stop', (evt) => {
        const { scrollTop, scrollLeft }: any = evt.target;
        // console.log('scrollTop:', scrollTop);
        if (this._change) {
          const nvalue = type === 'vertical' ? scrollTop : scrollLeft;
          const direction = nvalue > this._value ? '+' : '-';
          this._change(direction, nvalue, evt);
          this._value = nvalue;
        }
      });

    target.append(this._);
  }

  get value() {
    return this._value;
  }

  change(value: ScrollbarChanger) {
    this._change = value;
    return this;
  }

  scroll(): any;
  scroll(value: number): Scrollbar;
  scroll(value?: number): any {
    const { _, _type } = this;
    if (value) {
      if (_type === 'vertical') {
        _.scrolly(value);
      } else {
        _.scrollx(value);
      }
      return this;
    }
    return _type === 'vertical' ? _.scrolly() : _.scrollx();
  }

  test(value: number): boolean {
    return value > 0 && value <= this._maxValue;
  }

  // update this size
  resize(value: number, contentValue: number) {
    if (contentValue > value - 1) {
      const cssKey = typeCssKeys[this._type];
      this._content.css(cssKey, `${contentValue}px`);
      this._.css(cssKey, `${value}px`).show();

      this._maxValue = contentValue - value;
    } else {
      this._.hide();
    }
    return this;
  }
}
