"use strict";

const Selector = require("./Selector");

module.exports = class XPathSelector extends Selector {
    constructor(xPath, offset) {
        super("XPathSelector");
        this.value = xPath;
        this.offset = offset;
    }
};