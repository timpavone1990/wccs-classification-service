"use strict";

const PropertyCapable = require("./PropertyCapable");

module.exports = class Property extends PropertyCapable {
    constructor(type, xPath, content) {
        super();
        this.type = type;
        if (content) {
            this.content = content;
        }
        this.selector = {
            "type": "RangeSelector",
            "startSelector": {"type": "XPathSelector", "value": xPath, "offset": 0},
            "endSelector": {"type": "XPathSelector", "value": xPath, "offset": (content ? content.length : 0)}
        };
    }
};