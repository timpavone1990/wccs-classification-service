"use strict";

const logger = require("./Logger");

/**
 * It is not feasible to create a browser page for every page that needs to be classified,
 * because during high load the created processes would bring this service to a halt.
 *
 * Therefore we create a fixed number of browser pages, that can be reused.
 * If all browser pages are busy, the request needs to wait.
 *
 * This class manages browser pages and provides means to get and release browser pages.
 */
class BrowserPageProvider {
    constructor(pages, browser) {
        this.pagePool = pages;
        this.waiting = [];
        this.browser = browser;
    }

    async getPage() {
        if (this.pagePool.length === 0) {
            logger.debug("No page available.");
            return new Promise((resolve, reject) => {
                const callback = function (page) {
                    resolve(page)
                };
                this.waiting.push(callback);
            });
        } else {
            logger.debug("Page available.");
            return this.pagePool.pop();
        }
    }

    releasePage(page) {
        if (this.waiting.length === 0) {
            logger.debug("Nobody is waiting for a page. Putting page into the pool.");
            this.pagePool.push(page);
        } else {
            logger.debug("Passing page to waiting client.");
            const callback = this.waiting.shift();
            callback(page);
        }
    }

    async createReplacement(oldPage) {
        if (oldPage) {
            // Properly close old page. Otherwise creating a new one might cause errors.
            await oldPage.close();
            const page = await this.browser.newPage();
            this.releasePage(page);
        }
    }
}

module.exports.create = async (browser) => {
    const pages = [];
    const MAXIUM_CONCURRENT_PAGES = 5;
    logger.debug("Creating %d browser pages.", MAXIUM_CONCURRENT_PAGES);
    for (let i = 0; i < MAXIUM_CONCURRENT_PAGES; i++) {
        const page = await browser.newPage();
        pages.push(page);
    }
    return new BrowserPageProvider(pages, browser);
};