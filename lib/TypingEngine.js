"use strict";

const logger = require("./Logger");
const Page = require("./Page");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = class TypingEngine {
    constructor(httpRequestExecutor, configurationProvider) {
        this.httpRequestExecutor = httpRequestExecutor;
        this.configurationProvider = configurationProvider;
    }

    async processJob(job) {
        const failedPages = [];
        const allPromises = job.tasks.reduce((promises, task) => {
            const newPromises = task.pages.map(pageUrl => {
                return this.typePage(pageUrl, task.site)
                    .catch(e => {
                        failedPages.push(pageUrl);
                        logger.error("Processing page %s failed.\n%s", pageUrl, e.stack);
                    });
            });
            return promises.concat(newPromises);
        }, []);

        await Promise.all(allPromises);
        logger.debug("Failed pages: " + failedPages);
        return "dummy";
    }

    async typePage(url, site) {
        logger.debug("Starting processing of page %s", url);
        const [ pageHtml, pageType ]= await Promise.all([this.httpRequestExecutor.get(url), this.determinePageType(url)]);
        const page = new Page(pageType.name, url);

        const dom = new JSDOM(pageHtml);
        const document = dom.window.document;

        const propertyNames = Object.keys(pageType.properties);
        propertyNames.forEach(propertyName => {
            const property = pageType.properties[propertyName];
            const selectorValue = property.selector.value;
            const node = document.querySelector(selectorValue);
            page.properties[property.name] = {
                "type": property.type,
                "content": node.textContent
            };
        });

        return this.httpRequestExecutor.post(`http://storage-api:52629/sites/${site.id}/pages`, page)
            .then(() => {
                logger.debug("Finished processing of page %s", url);
            });
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