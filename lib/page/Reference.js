"use strict";

module.exports = class Reference {
    constructor(type, selector, destination) {
        this.type = type;
        this.selector = selector;
        this.destination = destination;
    }
};