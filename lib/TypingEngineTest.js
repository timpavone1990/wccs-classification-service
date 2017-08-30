"use strict";

const expect = require("chai").expect;

const configuration = require("../resources/typing-engine.conf");
const TypingEngine = require("./TypingEngine");

const testJob = {
    "pages": [
        "http://www.fernuni-hagen.de/KSW/portale/babw/service/"
    ]
};

describe("#type", () => {
    it("should type all pages correctly", async () => {
        // Using sinon seems a bit too heavy for one-method classes...
        const httpRequestExecutor = {
            "get": () => {
                return Promise.resolve("dummyPageData");
            }
        };

        const configurationProvider = {
            "getConfiguration": () => {
                return configuration;
            }
        };

        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider);
        const result = await typingEngine.processJob(testJob);
        expect(result).to.eql("dummy");
    });
});