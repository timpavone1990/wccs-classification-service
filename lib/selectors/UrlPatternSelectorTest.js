"use strict";

const expect = require("chai").expect;
const UrlPatternSelector = require("./UrlPatternSelector");

describe("#evaluate", () => {

    it("should match pattterns correctly", async () => {
        const selector = new UrlPatternSelector("http:\\\/\\\/www.fernuni-hagen.de\\\/KSW\\\/portale\\\/.+?\\\/service\\\/downloads\\\/?");

        const referencingSubNodes = [
            { "attributes": { "href": { "value": "http://www.fernuni-hagen.de/KSW/portale/babw/service/downloads/" } } },
            { "attributes": { "src": { "value": "http://www.fernuni-hagen.de/KSW/portale/abcd/service/downloads/" } } },
            { "attributes": { "srcset": { "value": "http://www.fernuni-hagen.de/KSW/portale/4711/service/downloads/" } } },
        ];

        const node = { "$$": () => Promise.resolve(referencingSubNodes) };
        const matches = await selector.evaluate(node);

        expect(matches.length).to.eql(3);
    }).timeout(60000);
});