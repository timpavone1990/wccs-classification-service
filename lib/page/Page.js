"use strict";

const FeatureCapable = require("./FeatureCapable");

module.exports = class Page extends FeatureCapable {
    constructor(pageClass, url) {
        super();
        this.class = pageClass;
        this.url = url;
        this.status = "Classified";
        this.references = {};
    }
};