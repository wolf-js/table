import React, { useEffect, useRef } from 'react';
import { stylePrefix } from '../config';

type ScrollbarOptionalProps = {
  onChange?: (value: number, evt: any) => void;
  unit?: 'px';
};

export type ScrollbarProp = {
  type: 'horizontal' | 'vertical';
  size: number;
  contentSize: number;
  scrollSize: number;
} & ScrollbarOptionalProps;

export type ScrollbarVerticalProp = {
  height: number;
  contentHeight: number;
  scrollTop: number;
} & ScrollbarOptionalProps;

export type ScrollbarHorizontalProp = {
  width: number;
  contentWidth: number;
  scrollLeft: number;
} & ScrollbarOptionalProps;

// type: vertical | horizontal
function Scrollbar({
  type = 'horizontal',
  onChange = () => {},
  size,
  contentSize,
  unit = 'px',
  scrollSize = 0,
}: ScrollbarProp) {
  if (size <= 0 || contentSize <= size) return null;
  const isHorizontal = type === 'horizontal';
  const cssKey = isHorizontal ? 'width' : 'height';
  const scrollHandler = (evt: any) => {
    const { scrollTop, scrollLeft } = evt.target;
    onChange(type === 'horizontal' ? scrollLeft : scrollTop, evt);
  };
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      (ref.current as HTMLElement)[type === 'horizontal' ? 'scrollLeft' : 'scrollTop'] = scrollSize;
    }
  }, [scrollSize]);

  return (
    <div
      className={`${stylePrefix}-scrollbar ${type}`}
      style={{ [cssKey]: `${size - 15}${unit}` }}
      onScroll={scrollHandler}
      ref={ref}>
      <div className="content" style={{ [cssKey]: `${contentSize}${unit}` }} />
    </div>
  );
}

Scrollbar.Corner = () => <div className={`${stylePrefix}-scrollbar-corner`} />;
Scrollbar.Vertical = ({ height, contentHeight, scrollTop, ...others }: ScrollbarVerticalProp) => {
  return (
    <Scrollbar type="vertical" size={height} contentSize={contentHeight} scrollSize={scrollTop} {...others} />
  );
};
Scrollbar.Horizontal = ({ width, contentWidth, scrollLeft, ...others }: ScrollbarHorizontalProp) => {
  return (
    <Scrollbar
      type="horizontal"
      size={width}
      contentSize={contentWidth}
      scrollSize={scrollLeft}
      {...others}
    />
  );
};

export type ScrollerProp = {
  x: number;
  y: number;
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  onChange?: (type: 'x' | 'y', value: number) => void;
};

export default function Scroller(props: ScrollerProp) {
  const { x, y, width, height, contentWidth, contentHeight, onChange } = props;
  if (!(contentWidth > width || contentHeight > height)) return null;
  const vchanger = (value: number) => {
    if (onChange) onChange('y', value);
  };
  const hchanger = (value: number) => {
    if (onChange) onChange('x', value);
  };
  return (
    <React.Fragment>
      <Scrollbar.Horizontal scrollLeft={x} width={width} contentWidth={contentWidth} onChange={hchanger} />
      <Scrollbar.Vertical scrollTop={y} height={height} contentHeight={contentHeight} onChange={vchanger} />
      <Scrollbar.Corner />
    </React.Fragment>
  );
}
