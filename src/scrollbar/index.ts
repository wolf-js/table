import { stylePrefix } from '../config';
import Element, { h } from '../element';

export type ScrollbarChanger = ((direction: '+' | '-', value: number, event: Event) => void) | null;

const typeCssKeys = { vertical: 'height', horizontal: 'width' };

export default class Scrollbar {
  _: Element;
  _content: Element;

  _value: number = 0;

  _type: 'vertical' | 'horizontal';

  _change: ScrollbarChanger = null;

  constructor(type: 'vertical' | 'horizontal') {
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

  // update this size
  resize(value: number, contentValue: number) {
    if (contentValue > value - 1) {
      const cssKey = typeCssKeys[this._type];
      this._content.css(cssKey, `${contentValue}px`);
      this._.css(cssKey, `${value}px`).show();
    } else {
      this._.hide();
    }
    return this;
  }
}
