"use strict";

const FeatureCapable = require("./FeatureCapable");

module.exports = class Page extends FeatureCapable {
    constructor(pageType, url) {
        super();
        this.type = pageType;
        this.url = url;
        this.references = {};
    }
};