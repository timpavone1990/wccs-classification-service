"use strict";

const CssSelector = require("./CssSelector");
const UrlPatternSelector = require("./UrlPatternSelector");

module.exports = class SelectorFactory {
    static create(type, value) {
        switch (type) {
            case "CssSelector":
                return new CssSelector(value);
            case "UrlPatternSelector":
                return new UrlPatternSelector(value);
            default:
                throw new Error(`Unsupported selector type '${type}'.`);
        }
    }
};