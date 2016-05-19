const THROTTLED_EVENTS = [
    'DOMMouseScroll',
    'MozMousePixelScroll',
    'mousemove',
    'mousewheel',
    'pointermove',
    'resize',
    'scroll',
    'touchmove',
    'wheel',
];

const Symbol = window.Symbol || function (name) {
    return `__LEGO__${name}`;
};

const EVENT_KEY = Symbol('events');

let fnId = 0;

function lookup(node, type, fn) {
    let obj = node[EVENT_KEY];
    if (typeof obj === 'undefined') {
        obj = node[EVENT_KEY] = {};
    }

    let list = obj[type];
    if (typeof list === 'undefined') {
        list = obj[type] = {};
    }

    if (typeof fn === 'undefined') {
        return list;
    }

    if (typeof fn[EVENT_KEY] === 'undefined') {
        fn[EVENT_KEY] = `fnId${++fnId}`;
    }

    let data = list[fn[EVENT_KEY]];
    if (typeof data === 'undefined' || !data.cb) {
        data = list[fn[EVENT_KEY]] = {};
    }

    return data;
}

function removeEventListener(node, type, data) {
    if (!data.cb) return;
    node.removeEventListener(type, data.cb);
    data.cb = false;
}

function throttle(node, type, fn) {
    const data = lookup(node, type, fn);
    let queued = false;
    let scope;

    function doFn() {
        queued = false;
        fn.call(scope, data.e);
        data.e = undefined;
    }

    return function (e) {
        scope = this;
        data.e = e;
        if (!queued) {
            requestAnimationFrame(doFn);
            queued = true;
        }
    };
}

export function on(node, type, fn, ignoreThrottle) {
    if (!node) return;

    if (node instanceof NodeList) {
        return Array.prototype.forEach.call(node, n => on(n, type, fn, ignoreThrottle));
    }
    if (Array.isArray(node)) {
        return node.forEach(n => on(n, type, fn, ignoreThrottle));
    }
    if (Array.isArray(type)) {
        return type.forEach(t => on(node, t, fn, ignoreThrottle));
    }
    if (typeof type === 'object') {
        return Object.keys(type).forEach(t => on(node, t, type[t], fn));
    }
    // exit if not an EventTarget
    if (!node.addEventListener) return;

    const data = lookup(node, type, fn);
    // only bind events once
    if (data.cb) return;

    data.cb = !ignoreThrottle && ~THROTTLED_EVENTS.indexOf(type) ? throttle(node, type, fn) : fn;
    return node.addEventListener(type, data.cb);
}

export function off(node, type, fn) {
    if (!node) return;
    
    if (node instanceof NodeList) {
        return Array.prototype.forEach.call(node, n => off(n, type, fn));
    }
    if (Array.isArray(node)) {
        return node.forEach(n => off(n, type, fn));
    }
    if (Array.isArray(type)) {
        return type.forEach(t => off(node, t, fn));
    }
    if (typeof type === 'object') {
        return Object.keys(type).forEach(t => off(node, t, type[t]));
    }
    
    // exit if not an EventTarget
    if (!node.removeEventListener) return;

    const data = lookup(node, type, fn);

    if (typeof fn === 'undefined') {
        Object.keys(data).forEach(key => removeEventListener(node, type, data[key]));
    }
    else {
        removeEventListener(node, type, data);
    }
}

export function one(node, type, fn) {
    const cb = function cb(e) {
        off(node, type, cb);
        fn.call(this, e);
    };
    on(node, type, cb, true);
}
