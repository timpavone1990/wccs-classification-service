"use strict";

module.exports = class Page {
    constructor(pageType, url) {
        this.type = pageType;
        this.url = url;
        this.properties = {};
        this.references = {};
    }

    addProperty(name, property) {
        if (Array.isArray(property)) {
            this.properties[name] = property.length === 1 ? property[0] : property;
        } else {
            this.properties[name] = property;
        }
    }
};