/*
 * JavaScript Templates 2.4.1
 * https://github.com/blueimp/JavaScript-Templates
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Inspired by John Resig's JavaScript Micro-Templating:
 * http://ejohn.org/blog/javascript-micro-templating/
 */
var cache = {};
var load = id => document.getElementById(id).innerHTML;
var regexp = /([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g;
var func = function (s, p1, p2, p3, p4, p5) {
    if (p1) { // whitespace, quote and backslash in HTML context
        return {
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            " " : " "
        }[p1] || "\\" + p1;
    }
    if (p2) { // interpolation: {%=prop%}, or unescaped: {%#prop%}
        return "'+_e(" + p3 + ",'" + p2 + "')+'";
    }
    if (p4) { // evaluation start tag: {%
        return "';";
    }
    if (p5) { // evaluation end tag: %}
        return "_s+='";
    }
};
const encode = function (s, t) {
    /*jshint eqnull:true */
    return s == null ? "" : t === '=' ? ("" + s) : ("" + s).replace(/[<>&"']/g,
        c => '&#' + c.charCodeAt(0) + ';');
};
export default function (id, data, context) {
    let f = cache[id] = cache[id] || new Function('d,_e,_c',
        "with(d){let _s = '" + load(id).replace(regexp, func) + "';return _s;}");
    return f(data, encode, context);
}
