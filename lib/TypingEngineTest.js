"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const puppeteer = require("puppeteer");

const configurationProvider = new (require("./ConfigurationProvider"))("../resources/typing-engine.conf.json");
const TypingEngine = require("./TypingEngine");
const HttpRequestExecutor = require("./HttpRequestExecutor");
const BrowserPageProvider = require("./BrowserPageProvider");

const testJob = {
    "tasks": [
        {
            "site": {
                "id": "site01",
                "name": "Site 01"
            },
            "pages": [
                `file://${process.cwd()}/resources/babw/service`,
                "http://www.my.dummy.host.de/KSW/portale/babw/service/"
            ]
        },
        {
            "site": {
                "id": "site02",
                "name": "Site 02"
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
        const postStub = sinon.stub(httpRequestExecutor, "put").callsFake(() => {
            return Promise.resolve();
        });

        const browserPageProvider = await BrowserPageProvider.create(browser);
        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider, browserPageProvider);
        await typingEngine.processJob(testJob);

        const encodedPageUrl = encodeURIComponent(testJob.tasks[0].pages[0]);

        expect(postStub.args[0][0]).to.eql(`http://storage-api:52629/sites/site01/pages/${encodedPageUrl}`);
        expect(postStub.args[0][1]).to.eql(require("../resources/ServicePageObject")());
    }).timeout(60000);
});

describe("#getEffectiveSelector", () => {

    let configuration;

    before(() => {
        configuration = configurationProvider.getConfiguration();
    });

    it("should throw if no selector was specified", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" } };
        expect(() => {
            typingEngine.getEffectiveSelector(property, configuration.contentClasses);
        }).to.throw();
    });

    it("should fallback to the selector specified by the type", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" }, "class": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectiveSelector(property, configuration.contentClasses);
        expect(effectiveSelector.value).to.eql("#content h3");
    });

    it("should use the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "type": "CssSelector", "value": "div > p" } };
        const effectiveSelector = typingEngine.getEffectiveSelector(property, configuration.contentClasses);
        expect(effectiveSelector.value).to.eql("div > p");
    });

    it("should prefer the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "type": "CssSelector", "value": "div > span" }, "class": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectiveSelector(property, configuration.contentClasses);
        expect(effectiveSelector.value).to.eql("div > span");
    });
});

describe("xpath string result", () => {
    let browser;

    before(async () => {
        browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    });

    after(() => {
        browser.close();
    });

    it("should type all pages correctly", async () => {
        const job = {
            "tasks": [
                {
                    "site": { "id": "site01", "name": "Site 01" },
                    "pages": [
                        `file://${process.cwd()}/resources/babw/lehrende`,
                    ]
                }
            ]
        };

        const lehrendeConfigProvider = new (require("./ConfigurationProvider"))("../resources/lehrende.conf.json");
        const httpRequestExecutor = new HttpRequestExecutor();
        const postStub = sinon.stub(httpRequestExecutor, "put").callsFake(() => {
            return Promise.resolve();
        });

        const browserPageProvider = await BrowserPageProvider.create(browser);
        const typingEngine = new TypingEngine(httpRequestExecutor, lehrendeConfigProvider, browserPageProvider);
        await typingEngine.processJob(job);

        const encodedPageUrl = encodeURIComponent(job.tasks[0].pages[0]);

        expect(postStub.args[0][0]).to.eql(`http://storage-api:52629/sites/site01/pages/${encodedPageUrl}`);
        expect(postStub.args[0][1]).to.eql(require("../resources/LehrendePageObject")());
    }).timeout(60000);
});