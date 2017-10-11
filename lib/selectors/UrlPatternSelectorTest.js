"use strict";

const expect = require("chai").expect;
const UrlPatternSelector = require("./UrlPatternSelector");

describe("#evaluate", () => {

    it("should match pattterns correctly", async () => {
        const selector = new UrlPatternSelector("http:\\\/\\\/www.fernuni-hagen.de\\\/KSW\\\/portale\\\/.+?\\\/service\\\/downloads\\\/?");

        const referencingSubNodes = [
            { "attributeValues": () => Promise.resolve({ "href": "http://www.fernuni-hagen.de/KSW/portale/babw/service/downloads/" })},
            { "attributeValues": () => Promise.resolve({ "src": "http://www.fernuni-hagen.de/KSW/portale/abcd/service/downloads/" })},
            { "attributeValues": () => Promise.resolve({ "srcset": "http://www.fernuni-hagen.de/KSW/portale/4711/service/downloads/" })}
        ];

        const node = { "$$": () => Promise.resolve(referencingSubNodes) };
        const matches = await selector.evaluate(node);

        expect(matches.length).to.eql(3);
    }).timeout(60000);
});