"use strict";

module.exports = class Reference {
    constructor(referenceClass, selector, destination) {
        this.class = referenceClass;
        this.selector = selector;
        this.destination = destination;
    }
};