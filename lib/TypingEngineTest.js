"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const fs = require("fs");

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
                "http://www.fernuni-hagen.de/KSW/portale/babw/service/",
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

describe("#type", () => {
    it("should type all pages correctly", async () => {
        const babwServicesHtml = fs.readFileSync("resources/babw_services.html", "UTF-8");

        const httpRequestExecutor = new HttpRequestExecutor();
        sinon.stub(httpRequestExecutor, "get").callsFake(() => {
            return Promise.resolve(babwServicesHtml);
        });

        const postStub = sinon.stub(httpRequestExecutor, "post").callsFake(() => {
            return Promise.resolve();
        });

        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider);
        const result = await typingEngine.processJob(testJob);

        expect(result).to.eql("dummy");
        expect(postStub.args[0][0]).to.eql("http://storage-api:52629/sites/site01/pages");
        expect(postStub.args[0][1]).to.eql({
            "type": "Service",
            "url": "http://www.fernuni-hagen.de/KSW/portale/babw/service/",
            "properties": {
                "heading": {
                    "type": "Text",
                    "content": "Service"
                }
            },
            "references": {}
        });
    });
});