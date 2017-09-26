"use strict";

const Selector = require("./Selector");

module.exports = class CssSelector extends Selector {
    async evaluate(node) {
        return node.$$(this.value);
    }

    toString() {
        return `CssSelector(value='${this.value}')`;
    }
};