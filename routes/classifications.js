"use strict";

const logger = require("../lib/Logger");
const express = require('express');
const router = express.Router();
const unirest = require('unirest');
const BrowserPageProvider = require("../lib/BrowserPageProvider");

const configurationProvider = new (require("../lib/ConfigurationProvider"))("/conf/typing-engine.conf.json");
const httpRequestExecutor = new (require("../lib/HttpRequestExecutor"))(unirest);

const puppeteer = require("puppeteer");
const typingEnginePromise = (async () => {
    const browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    const browserManager = await BrowserPageProvider.create(browser);
    return new (require("../lib/TypingEngine"))(httpRequestExecutor, configurationProvider, browserManager);
})();

router.post('/', async (request, response, next) => {
    try {
        const typingEngine = await typingEnginePromise;
        typingEngine.processJob(request.body);
        // TODO Endpoint to query status
        response.status(202).end();
    } catch (e) {
        next(e);
    }
});

module.exports = router;