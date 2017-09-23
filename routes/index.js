"use strict";

const logger = require("../lib/Logger");
const express = require('express');
const router = express.Router();
const unirest = require('unirest');
const BrowserPageProvider = require("../lib/BrowserPageProvider");

const configurationProvider = new (require("../lib/ConfigurationProvider"))("/conf/typing-engine.conf.js");
const httpRequestExecutor = new (require("../lib/HttpRequestExecutor"))(unirest);

const puppeteer = require("puppeteer");
const typingEnginePromise = (async () => {
    const browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    const browserManager = await BrowserPageProvider.create(browser);
    return new (require("../lib/TypingEngine"))(httpRequestExecutor, configurationProvider, browserManager);
})();

router.post('/', async (request, response, next) => {
    try {
        logger.info("Incoming request");
        const typingEngine = await typingEnginePromise;
        await typingEngine.processJob(request.body);
        // TODO Location header
        response.status(201).end();
    } catch (e) {
        next(e);
    }
});

module.exports = router;