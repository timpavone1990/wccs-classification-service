"use strict";

const logger = require("./Logger");
const Page = require("./Page");
const Property = require("./Property");
const NodeWrapper = require("./NodeWrapper");

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
    }

    async typePage(url, site) {
        logger.debug("Starting processing of page %s", url);
        const browserPage = await this.browser.newPage();
        browserPage.on('console', (...args) => {
            logger.debug("Browser log: %s", ...args);
        });
        await browserPage.setViewport({"width": 1920, "height": 1080});

        const [ gotoResponse, pageType ] = await Promise.all([browserPage.goto(url), this.determinePageType(url)]);

        // TODO We're making an exception for TypingEngineTest here.
        if (gotoResponse.ok || url.startsWith("file://")) {
            await browserPage.injectFile("lib/XPathCalculator.js");
            const page = new Page(pageType.name, url);
            const propertyPromises = this.createPropertiesRecursively(browserPage, pageType, page, browserPage);
            const referencesPromises = this.createReferences(browserPage, pageType, page, browserPage);
            await Promise.all(propertyPromises);
            await Promise.all(referencesPromises);
            return this.storePage(site.id, page);
        } else {
            throw new Error(`Could not navigate to ${url}. Status ${gotoResponse.status}.`);
        }
    }

    createPropertiesRecursively(parentNode, parentObjectType, parentObject, browserPage) {
        const propertyNames = Object.keys(parentObjectType.properties);
        return propertyNames.map(async propertyName => {
            const propertyDefinition = parentObjectType.properties[propertyName];
            const selectorValue = this.getEffectiveSelector(propertyDefinition, this.configuration.contentTypes);
            // TODO Adapt when ready: https://github.com/GoogleChrome/puppeteer/issues/508
            const nodes = await parentNode.$$(selectorValue);

            if (nodes && nodes.length > 0) {
                if (!propertyDefinition.isCollection && nodes.length > 1) {
                    logger.warn("Expected one match for property %s, but found %d in %s", propertyDefinition.name, nodes.length);
                }

                const propertyItemPromises = nodes.map(async node => {
                    const nodeWrapper = new NodeWrapper(node, browserPage);
                    const [content, xPath] = await nodeWrapper.innerTextAndXPath();
                    const propertyType = this.configuration.contentTypes[propertyDefinition.type];
                    let property;
                    if (Object.keys(propertyType.properties).length === 0) {
                        property = new Property(propertyDefinition.type, xPath, content);
                    } else {
                        property = new Property(propertyDefinition.type, xPath);
                    }
                    await Promise.all(this.createPropertiesRecursively(nodeWrapper, propertyType, property, browserPage));
                    return property;
                });
                const propertyItems = await Promise.all(propertyItemPromises);

                if (propertyDefinition.isCollection) {
                    parentObject.addCollectionProperty(propertyDefinition.name, propertyItems);
                } else {
                    if (propertyItems.length > 1) {
                        logger.warn("Trying to set a collection as scalar property. Will use the first item.");
                    }
                    parentObject.addProperty(propertyDefinition.name, propertyItems[0]);
                }
            } else {
                logger.warn("Property %s not found using selector %s.", propertyName, selectorValue);
            }
        });
    }

    createReferences(parentNode, parentObjectType, parentObject, browserPage) {
        const referencesNames = Object.keys(parentObjectType.references);
        return referencesNames.map(async referenceName => {
            const referenceDefinition = parentObjectType.references[referenceName];
            const selectorValue = this.getEffectiveSelector(referenceDefinition, this.configuration.referenceTypes);
            // TODO Adapt when ready: https://github.com/GoogleChrome/puppeteer/issues/508
            const nodes = await parentNode.$$(selectorValue);

        });
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

    getEffectiveSelector(feature, types) {
        const selectorByFeature = feature.selector || {};

        if (selectorByFeature.value) {
            return selectorByFeature.value;
        } else {
            const type = types[feature.type] || {};
            const selectorByType = type.selector || {};
            if (selectorByType.value) {
                return selectorByType.value;
            } else {
                throw new Error(`No selector could be determined for feature ${feature.name}.`);
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