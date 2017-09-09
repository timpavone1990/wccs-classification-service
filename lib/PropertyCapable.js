"use strict";

module.exports = class PropertyCapable {
    constructor() {
        this.properties = {};
    }

    addProperty(name, property) {
        if (Array.isArray(property)) {
            this.properties[name] = property.length === 1 ? property[0] : property;
        } else {
            this.properties[name] = property;
        }
    }
};