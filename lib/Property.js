"use strict";

module.exports = class Property {
    constructor(type, content, xPath) {
        this.type = type;
        this.content = content;
        this.selector = {
            "type": "RangeSelector",
            "startSelector": {"type": "XPathSelector", "value": xPath, "offset": 0},
            "endSelector": {"type": "XPathSelector", "value": xPath, "offset": content.length}
        };
    }
};