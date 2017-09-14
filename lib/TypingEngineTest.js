"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
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
                "http://www.my.dummy.host.de/KSW/portale/babw/service/"
            ]
        },
        {
            "site": {
                "id": "site02",
                "displayName": "Site 02"
            },
            "pages": [
                "http://www.my.dummy.host.de/KSW/portale/qwertz/service/",
                "http://www.my.dummy.host.de/KSW/portale/qwertz123/service/"
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

        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider, browser);
        await typingEngine.processJob(testJob);

        expect(postStub.args[0][0]).to.eql("http://storage-api:52629/sites/site01/pages");
        expect(postStub.args[0][1]).to.eql(require("../resources/ServicePageObject")());
    }).timeout(60000);
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