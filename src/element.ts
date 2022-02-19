function createFragment(...nodes: (Element | Node | string)[]) {
  const fragment = document.createDocumentFragment();
  nodes.forEach((node) => {
    let nnode: Node;
    if (node instanceof Element) nnode = node._;
    else if (typeof node === 'string') nnode = document.createTextNode(node);
    else nnode = node;
    fragment.appendChild(nnode);
  });
  return fragment;
}

export default class Element {
  _: HTMLElement;
  _data = new Map();

  constructor(tag: string, className?: string | string[] | Object) {
    this._ = document.createElement(tag);
    if (className) {
      if (typeof className === 'string') {
        this._.className = className;
      } else if (Array.isArray(className)) {
        this._.className = className.join(' ');
      } else {
        for (let [key, value] of Object.entries(className)) {
          if (value) this._.classList.add(key);
        }
      }
    }
  }

  data(key: string): any;
  data(key: string, value: any): Element;
  data(key: string, value?: any) {
    if (value) {
      this._data.set(key, value);
      return this;
    } else {
      return this._data.get(key);
    }
  }

  on(eventName: string, handler: (evt: Event) => void) {
    const [evtName, ...prop] = eventName.split('.');
    this._.addEventListener(evtName, (evt) => {
      handler(evt);
      for (let i = 0; i < prop.length; i += 1) {
        if (prop[i] === 'stop') {
          evt.stopPropagation();
        }
        if (prop[i] === 'prevent') {
          evt.preventDefault();
        }
      }
    });
    return this;
  }

  attr(key: string): string;
  attr(key: string, value: string): Element;
  attr(key: string, value?: string): any {
    if (value) {
      this._.setAttribute(key, value);
      return this;
    }
    return this._.getAttribute(key);
  }

  css(key: string): string;
  css(key: string, value: string): Element;
  css(key: string, value?: string): any {
    if (value) {
      this._.style.setProperty(key, value);
      return this;
    }
    return this._.style.getPropertyValue(key);
  }

  rect() {
    return this._.getBoundingClientRect();
  }

  show() {
    this.css('display', 'block');
    return this;
  }

  hide() {
    this.css('display', 'hide');
    return this;
  }

  scrollx(): number;
  scrollx(value: number): Element;
  scrollx(value?: number): any {
    const { _ } = this;
    if (value) {
      _.scrollLeft = value;
      return this;
    }
    return _.scrollLeft;
  }

  scrolly(): number;
  scrolly(value: number): Element;
  scrolly(value?: number): any {
    const { _ } = this;
    if (value) {
      _.scrollTop = value;
      return this;
    }
    return _.scrollTop;
  }

  after(...nodes: (Element | Node | string)[]) {
    this._.after(createFragment(...nodes));
    return this;
  }

  before(...nodes: (Element | Node | string)[]) {
    this._.before(createFragment(...nodes));
    return this;
  }

  append(...nodes: (Element | Node | string)[]) {
    this._.append(createFragment(...nodes));
    return this;
  }
}

export function h(tag: string, className?: string | string[] | Object) {
  return new Element(tag, className);
}
