"use strict";

const Selector = require("./Selector");

module.exports = class RangeSelector extends Selector {
    constructor(startSelector, endSelector) {
        super("RangeSelector");
        this.startSelector = startSelector;
        this.endSelector = endSelector;
    }
};