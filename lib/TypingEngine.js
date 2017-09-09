"use strict";

const logger = require("./Logger");
const Page = require("./Page");
const Property = require("./Property");

module.exports = class TypingEngine {
    constructor(httpRequestExecutor, configurationProvider, browser) {
        this.httpRequestExecutor = httpRequestExecutor;
        this.configurationProvider = configurationProvider;
        this.configuration = this.configurationProvider.getConfiguration();
        this.browser = browser;
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
        const browserPage = await this.browser.newPage();
        await browserPage.setViewport({"width": 1920, "height": 1080});

        const [ gotoResponse, pageType ] = await Promise.all([browserPage.goto(url), this.determinePageType(url)]);

        // TODO We're making an exception for TypingEngineTest here.
        if (gotoResponse.ok || url.startsWith("file://")) {
            await browserPage.injectFile("lib/XPathCalculator.js");
            const page = new Page(pageType.name, url);

            const propertyNames = Object.keys(pageType.properties);
            const propertyPromises = propertyNames.map(async propertyName => {
                const propertyDefinition = pageType.properties[propertyName];
                const selectorValue = this.getEffectivePropertySelector(propertyDefinition);
                const node = await browserPage.$(selectorValue);

                if (node) {
                    const [ content, xPath ] = await node.evaluate(element => [ element.innerText, window.wcts.XPathCalculator.fromNode(element) ]);
                    page.addProperty(propertyDefinition.name, new Property(propertyDefinition.type, content, xPath));
                } else {
                    logger.warn("Property %s not found on %s using selector %s.", propertyName, url, selectorValue);
                }
            });

            await Promise.all(propertyPromises);
            return this.storePage(site.id, page);
        } else {
            throw new Error(`Could not navigate to ${url}. Status ${gotoResponse.status}.`);
        }
    }

    async determinePageType(url) {
        logger.debug("Determining page type of %s", url);
        for (const name in this.configuration.pageTypes) {
            if (this.configuration.pageTypes.hasOwnProperty(name)) {
                const pageType = this.configuration.pageTypes[name];

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

    getEffectivePropertySelector(property) {
        const selectorByProperty = property.selector || {};

        if (selectorByProperty.value) {
            return selectorByProperty.value;
        } else {
            const type = this.configuration.contentTypes[property.type] || {};
            const selectorByType = type.selector || {};
            if (selectorByType.value) {
                return selectorByType.value;
            } else {
                throw new Error(`No selector could be determined for property ${property.name}.`);
            }
        }
    }

    async storePage(siteId, page) {
        return this.httpRequestExecutor.post(`http://storage-api:52629/sites/${siteId}/pages`, page)
            .then(() => {
                logger.debug("Finished processing of page %s", page.url);
            });
    }
};