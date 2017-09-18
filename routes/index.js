"use strict";

const express = require('express');
const router = express.Router();
const unirest = require('unirest');

const configurationProvider = new (require("../lib/ConfigurationProvider"))("/conf/typing-engine.conf.js");
const httpRequestExecutor = new (require("../lib/HttpRequestExecutor"))(unirest);

const puppeteer = require("puppeteer");
const typingEnginePromise = (async () => {
    const browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    return new (require("../lib/TypingEngine"))(httpRequestExecutor, configurationProvider, browser);
})();

router.post('/', async (request, response, next) => {
    try {
        const typingEngine = await typingEnginePromise;
        await typingEngine.processJob(request.body);
        // TODO Location header
        response.status(201).end();
    } catch (e) {
        next(e);
    }
});

module.exports = router;