"use strict";

const logger = require("./Logger");

module.exports = class TypingEngine {
    constructor(httpRequestExecutor, configurationProvider) {
        this.httpRequestExecutor = httpRequestExecutor;
        this.configurationProvider = configurationProvider;
    }

    async processJob(job) {
        const failedPages = [];
        const promises = job.pages.map(pageUrl => {
            return this.typePage(pageUrl)
                .catch((e) => {
                    failedPages.push(pageUrl);
                    logger.error("Processing page %s failed: status=%s, message=%s", pageUrl, e.status, e.message);
                });
        });

        await Promise.all(promises);
        logger.debug(failedPages);
        return "dummy";
    }

    async typePage(url) {
        logger.debug("Starting processing of page %s", url);
        const [pageHtml, pageType ]= await Promise.all([this.httpRequestExecutor.get(url), this.determinePageType(url)]);
        logger.debug("Finished processing of page %s", url);
    }

    async determinePageType(url) {
        logger.debug("Determining page type of %s", url);
        const configuration = this.configurationProvider.getConfiguration();
        for (const name in configuration.pageTypes) {
            if (configuration.pageTypes.hasOwnProperty(name)) {
                const pageType = configuration.pageTypes[name];

                // TODO Could be cached?
                const regex = new RegExp(pageType.selector.value);
                if (regex.test(url)) {
                    logger.debug("Determining page type of %s finished. result=%s", url, name);
                    return pageType;
                }
            }
        }
        logger.debug("%s does not match any know page type", url);
        return false;
    }
};