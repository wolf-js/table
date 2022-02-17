const template = document.createElement('template');

template.innerHTML = `
  <style>
    .scrollbar {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: #f4f5f8;
      opacity: 0.9;
      z-index: 12;
    }
    .scrollbar.horizontal {
      height: 15px;
      right: 15px;
      overflow-x: scroll;
      overflow-y: hidden;
    }
    .scrollbar.horizontal .content {
      height: 1px;
      background: #ddd;
    }
    .scrollbar.vertical {
      width: 15px;
      bottom: 15px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .scrollbar.vertical .content {
      width: 1px;
      background: #ddd;
    }
    .scrollbar-corner {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 14px;
      height: 14px;
      border-left: 1px solid #ddd;
      border-top: 1px solid #ddd;
      background-color: #f4f5f8;
    }
  </style>
  <div class="scrollbar vertical">
    <div class="content"/>
  </div>
  <div class="scrollbar horizontal">
    <div class="content"/>
  </div>
  <div class="scrollbar-corner"/>
`;

export default class Scroller extends HTMLElement {
  _shadowRoot;

  _value = { x: 0, y: 0, width: 0, height: 0, contentWidth: 0, contentHeight: 0 };

  constructor() {
    super();

    // Create a shadow root
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }

  // v: {x, y, width, height, contentWidth, contentHeight}
  value(v) {
    if (v) {
      Object.keys(value).forEach((key) => (this[`_${key}`] = value[key]));
    } else {
      this._value = v;
    }
  }

  onscroll = (evt) => {};

  // Invoked each time the custom element is appended into a document-connected element.
  connectedCallback() {}

  // Invoked each time the custom element is disconnected from the document's DOM.
  disconnectedCallback() {}

  // Invoked each time the custom element is moved to a new document.
  adoptedCallback() {}

  // Invoked each time one of the custom element's attributes is added, removed, or changed
  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define('scroller', Scroller);
