"use strict";

module.exports = class Selector {
    constructor(value) {
        this.value = value;
    }

    async evaluate(node) {
        throw new Error("Selector is an abstract class. Use one of its subclasses.");
    }
};