"use strict";

const PropertyCapable = require("./PropertyCapable");

module.exports = class Page extends PropertyCapable {
    constructor(pageType, url) {
        super();
        this.type = pageType;
        this.url = url;
        this.references = {};
    }
};