"use strict";

const FeatureCapable = require("./FeatureCapable");

module.exports = class Property extends FeatureCapable {
    constructor(type, selector, content) {
        super();
        this.type = type;
        this.selector = selector;
        if (content) {
            this.content = content;
        }
    }
};