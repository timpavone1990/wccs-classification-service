"use strict";

const Selector = require("./Selector");

module.exports = class UrlPatternSelector extends Selector {
    constructor(value) {
        super(value);
        this.regex = new RegExp(value);
    }

    async evaluate(node) {
        const possibleMatches = await node.$$("[href], [src], [srcset]");
        const matches = [];
        const promises = possibleMatches.map(async match => {
            const attributeValues = await match.attributeValues("href", "src", "srcset");
            const attributeValue = attributeValues.href || attributeValues.src|| attributeValues.srcset;
            if (this.regex.test(attributeValue)) {
                matches.push(match);
            }
        });
        await Promise.all(promises);
        return matches;
    }

    toString() {
        return `UrlPatternSelector(value='${this.value}')`;
    }
};
