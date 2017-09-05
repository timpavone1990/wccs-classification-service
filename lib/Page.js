"use strict";

module.exports = class Page {
    constructor(pageType, url) {
        this.type = pageType;
        this.url = url;
        this.properties = {};
        this.references = {};
    }
};