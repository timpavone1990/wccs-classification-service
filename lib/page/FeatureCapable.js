"use strict";

module.exports = class FeatureCapable {
    constructor() {
        this.contents = {};
        this.references = {};
    }

    addProperty(name, property) {
        this.contents[name] = property;
    }

    addCollectionProperty(name, property) {
        this.addProperty(name, Array.isArray(property) ? property : [ property ]);
    }

    addReference(name, reference) {
        this.references[name] = reference;
    }

    addCollectionReference(name, reference) {
        this.addReference(name, Array.isArray(reference) ? reference : [ reference ]);
    }
};