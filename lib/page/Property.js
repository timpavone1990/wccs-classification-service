"use strict";

const FeatureCapable = require("./FeatureCapable");

module.exports = class Property extends FeatureCapable {
    constructor(contentClass, selector, content) {
        super();
        this.class = contentClass;
        this.selector = selector;
        if (content) {
            this.content = content;
        }
    }
};