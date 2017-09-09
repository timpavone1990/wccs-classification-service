"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const fs = require("fs");

const puppeteer = require("puppeteer");

const configurationProvider = new (require("./ConfigurationProvider"))("../resources/typing-engine.conf");
const TypingEngine = require("./TypingEngine");
const HttpRequestExecutor = require("./HttpRequestExecutor");

const testJob = {
    "tasks": [
        {
            "site": {
                "id": "site01",
                "displayName": "Site 01"
            },
            "pages": [
                `file://${process.cwd()}/resources/babw/service`,
                "http://www.fernuni-hagen.de/KSW/portale/babw123/service/"
            ]
        },
        {
            "site": {
                "id": "site02",
                "displayName": "Site 02"
            },
            "pages": [
                "http://www.fernuni-hagen.de/KSW/portale/qwertz/service/",
                "http://www.fernuni-hagen.de/KSW/portale/qwertz123/service/"
            ]
        }
    ]
};

describe("#processJob", () => {

    let browser;

    before(async () => {
        browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    });

    after(() => {
        browser.close();
    });

    it("should type all pages correctly", async () => {
        const httpRequestExecutor = new HttpRequestExecutor();
        const postStub = sinon.stub(httpRequestExecutor, "post").callsFake(() => {
            return Promise.resolve();
        });

        //const browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider, browser);
        const result = await typingEngine.processJob(testJob);

        expect(result).to.eql("dummy");
        expect(postStub.args[0][0]).to.eql("http://storage-api:52629/sites/site01/pages");
        expect(postStub.args[0][1]).to.eql({
            "type": "Service",
            "url": `file://${process.cwd()}/resources/babw/service`,
            "properties": {
                "heading": {
                    "type": "PageHeading",
                    "content": "Service",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": { "type": "XPathSelector", "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/h3[1]","offset": 0 },
                        "endSelector": { "type": "XPathSelector", "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/h3[1]", "offset": 7 }
                    },
                },
                "subHeading": {
                    "type": "SectionHeading",
                    "content": "Fragen und Antworten zum B.A. Bildungswissenschaft (F.A.Q.s)",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": {
                            "offset": 0,
                            "type": "XPathSelector",
                            "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/h4[1]"
                        },
                        "endSelector": {
                            "offset": 60,
                            "type": "XPathSelector",
                            "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/h4[1]"
                        }
                    }
                },
                "introduction": {
                    "type": "Text",
                    "content": "Viele Fragen zum B.A. Bildungswissenschaft klären sich durch die Lektüre dieser FAQs! Bitte machen Sie zunächst von diesem Angebot Gebrauch, bevor Sie sich an die Studienberatung wenden. \n(Stand: 06/2015)",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": {
                            "offset": 0,
                            "type": "XPathSelector",
                            "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/div[1]/p[1]",
                        },
                        "endSelector": {
                            "offset": 204,
                            "type": "XPathSelector",
                            "value": "/div[1]/section[2]/div[1]/div[1]/div[2]/div[1]/p[1]"
                        },
                    }
                }
            },
            "references": {}
        });
    }).timeout(5000);
});

describe("#getEffectivePropertySelector", () => {
    it("should throw if no selector was specified", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" } };
        expect(() => {
            typingEngine.getEffectivePropertySelector(property);
        }).to.throw();
    });

    it("should fallback to the selector specified by the type", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" }, "type": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("#content h3");
    });

    it("should use the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "div > p" } };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("div > p");
    });

    it("should prefer the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "div > span" }, "type": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("div > span");
    });
});