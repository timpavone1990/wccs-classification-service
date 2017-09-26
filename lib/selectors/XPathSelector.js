"use strict";

const Selector = require("./Selector");

module.exports = class XPathSelector extends Selector {
    constructor(value) {
        super(value);
    }

    async evaluate(node) {
        const matches = await node.evaluateXPath(this.value);
        return matches;
    }

    toString() {
        return `XPathSelector(value='${this.value}')`;
    }
};
