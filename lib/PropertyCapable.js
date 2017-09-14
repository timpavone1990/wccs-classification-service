"use strict";

module.exports = class PropertyCapable {
    constructor() {
        this.properties = {};
    }

    addProperty(name, property) {
        this.properties[name] = property;
    }

    addCollectionProperty(name, property) {
        this.addProperty(name, Array.isArray(property) ? property : [ property ]);
    }
};