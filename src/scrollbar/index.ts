import { stylePrefix } from '../config';
import Element, { h } from '../element';

export type ScrollbarChanger = ((value: number, event: Event) => void) | null;

const typeCssKeys = { vertical: 'height', horizontal: 'width' };

export default class Scrollbar {
  _el: Element;
  _contentEl: Element;

  _type: 'vertical' | 'horizontal';

  _change: ScrollbarChanger = null;

  constructor(type: 'vertical' | 'horizontal') {
    this._type = type;
    this._contentEl = h('div', 'content');
    this._el = h('div', `${stylePrefix}-scrollbar ${type}`)
      .append(this._contentEl)
      .on('scroll.stop', (evt) => {
        const { scrollTop, scrollLeft }: any = evt.target;
        // console.log('scrollTop:', scrollTop);
        if (this._change) {
          this._change(type === 'vertical' ? scrollTop : scrollLeft, evt);
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
    const { _el, _type } = this;
    if (value) {
      if (_type === 'vertical') {
        _el.scrolly(value);
      } else {
        _el.scrollx(value);
      }
      return this;
    }
    return _type === 'vertical' ? _el.scrolly() : _el.scrollx();
  }

  // update this size
  resize(value: number, contentValue: number) {
    if (contentValue > value - 1) {
      const cssKey = typeCssKeys[this._type];
      this._contentEl.css(cssKey, `${contentValue}px`);
      this._el.css(cssKey, `${value - 15}px`).show();
    } else {
      this._el.hide();
    }
  }
}
