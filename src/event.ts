export function bind(target: any, name: string, callback: (evt: any) => void) {
  target.addEventListener(name, callback);
}

export function unbind(target: any, name: string, callback: (evt: any) => void) {
  target.removeEventListener(name, callback);
}

export function mouseMoveup(target: any, moveFunc: (evt: any) => void, upFunc: (evt: any) => void) {
  bind(target, 'mousemove', moveFunc);
  target._eventup = (evt: any) => {
    unbind(target, 'mousemove', moveFunc);
    unbind(target, 'mouseup', target._eventup);
    upFunc(evt);
  };
  bind(target, 'mouseup', target._eventup);
}
