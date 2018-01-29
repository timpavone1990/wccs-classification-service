"use strict";

const logger = require("./Logger");
const Page = require("./page/Page");
const Property = require("./page/Property");
const Reference = require("./page/Reference");
const NodeWrapper = require("./NodeWrapper");
const SelectorFactory = require("./selectors/SelectorFactory");
const RangeSelector = require("./page/selectors/RangeSelector");
const XPathSelector = require("./page/selectors/XPathSelector");

module.exports = class TypingEngine {
    constructor(httpRequestExecutor, configurationProvider, browserPageProvider) {
        this.httpRequestExecutor = httpRequestExecutor;
        this.configurationProvider = configurationProvider;
        this.configuration = this.configurationProvider.getConfiguration();
        this.browserPageProvider = browserPageProvider;
    }

    async processJob(job) {
        const failedPages = [];
        const allPromises = job.tasks.reduce((promises, task) => {
            const newPromises = task.pages.map(async pageUrl => {
                const browserPage = await this.browserPageProvider.getPage();
                return this.typePage(pageUrl, task.site, browserPage)
                    .then(() => {
                        this.browserPageProvider.releasePage(browserPage);
                    })
                    .catch(e => {
                        // TODO Do not swallow errors
                        failedPages.push(pageUrl);
                        logger.error("Processing page %s failed.\n%s", pageUrl, e.stack);

                        // E.g. after a navigation error, the browser page can not be reused and we need to create a new one
                        const promise = this.browserPageProvider.createReplacement(browserPage);
                        promise.catch(e => {
                            logger.error("Could not create a new page.\n", e.stack);
                        });
                    });
            });
            return promises.concat(newPromises);
        }, []);

        await Promise.all(allPromises);
        logger.debug("Failed pages: " + failedPages);
    }

    async typePage(url, site, browserPage) {
        logger.debug("Starting processing of page %s", url);
        browserPage.on('console', (...args) => {
            logger.debug("Browser log: %s", ...args);
        });
        await browserPage.setViewport({"width": 1920, "height": 1080});

        const pageType = await this.determinePageType(url);

        // TODO We're making an exception for TypingEngineTest here.
        if (pageType || url.startsWith("file://")) {
            const gotoResponse = await browserPage.goto(url);
            if (gotoResponse.ok || url.startsWith("file://")) {
                await browserPage.injectFile("lib/XPathCalculator.js");
                const page = new Page(pageType.name, url);
                const browserPageWrapper = new NodeWrapper(browserPage, browserPage);
                const propertyPromises = this.createPropertiesRecursively(browserPageWrapper, pageType, page, browserPage);
                const referencesPromises = this.createReferences(browserPageWrapper, pageType, page, browserPage);
                await Promise.all(propertyPromises);
                await Promise.all(referencesPromises);
                return this.storePage(site.id, page);
            } else {
                // If the page class could not be determined, that is no error and a warning has already been logged.
                throw new Error(`Could not navigate to ${url}. Status ${gotoResponse.status}.`);
            }
        }
    }

    createPropertiesRecursively(parentNode, parentObjectType, parentObject, browserPage) {
        const propertyNames = Object.keys(parentObjectType.contents);
        return propertyNames.map(async propertyName => {
            const propertyDefinition = parentObjectType.contents[propertyName];
            const selector = this.getEffectiveSelector(propertyDefinition, this.configuration.contentClasses);
            // TODO Adapt when ready: https://github.com/GoogleChrome/puppeteer/issues/508
            const nodes = await selector.evaluate(parentNode);

            if (nodes && nodes.length > 0) {
                if (!propertyDefinition.isCollection && nodes.length > 1) {
                    logger.warn("Expected one match for property %s, but found %d.", propertyDefinition.name, nodes.length);
                }

                const propertyItemPromises = nodes.map(async node => {
                    const propertyType = this.configuration.contentClasses[propertyDefinition.class];
                    const nodeInfos = await node.nodeInfos();
                    const startSelector = new XPathSelector(nodeInfos.xPath, nodeInfos.startOffset || 0);
                    const endSelector = new XPathSelector(nodeInfos.xPath, nodeInfos.endOffset || nodeInfos.innerText.length);
                    const selector = new RangeSelector(startSelector, endSelector);
                    let property;
                    if (Object.keys(propertyType.contents).length === 0) {
                        property = new Property(propertyDefinition.class, selector, nodeInfos.innerText);
                    } else {
                        property = new Property(propertyDefinition.class, selector);
                    }
                    if (!nodeInfos.stopRecursion) {
                        const propertyPromises = this.createPropertiesRecursively(node, propertyType, property, browserPage);
                        const referencesPromises = this.createReferences(node, propertyType, property, browserPage);
                        await Promise.all(propertyPromises);
                        await Promise.all(referencesPromises);
                    }
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
                logger.warn("Property %s not found using selector %s.", propertyName, selector);
            }
        });
    }

    createReferences(parentNode, parentObjectType, parentObject, browserPage) {
        const referencesNames = Object.keys(parentObjectType.references);
        return referencesNames.map(async referenceName => {
            const referenceDefinition = parentObjectType.references[referenceName];
            const selector = this.getEffectiveSelector(referenceDefinition, this.configuration.referenceClasses);
            // TODO Adapt when ready: https://github.com/GoogleChrome/puppeteer/issues/508
            const nodes = await selector.evaluate(parentNode);

            if (nodes && nodes.length > 0) {
                if (!referenceDefinition.isCollection && nodes.length > 1) {
                    logger.warn("Expected one match for reference %s, but found %d.", referenceDefinition.name, nodes.length);
                }

                const referenceItemPromises = nodes.map(async node => {
                    const referenceType = this.configuration.referenceClasses[referenceDefinition.class];
                    const nodeInfos = await node.nodeInfos();
                    const startSelector = new XPathSelector(nodeInfos.xPath, nodeInfos.startOffset || 0);
                    const endSelector = new XPathSelector(nodeInfos.xPath, nodeInfos.endOffset || nodeInfos.innerText.length);
                    const selector = new RangeSelector(startSelector, endSelector);
                    return new Reference(referenceDefinition.class, selector, nodeInfos.destination);
                });

                const referenceItems = await Promise.all(referenceItemPromises);
                if (referenceDefinition.isCollection) {
                    parentObject.addCollectionReference(referenceDefinition.name, referenceItems);
                } else {
                    if (referenceItems.length > 1) {
                        logger.warn("Trying to set a collection as scalar reference. Will use the first item.");
                    }
                    parentObject.addReference(referenceDefinition.name, referenceItems[0]);
                }
            } else {
                logger.warn("Reference %s not found using selector %s.", referenceName, selector.value);
            }
        });
    }

    async determinePageType(url) {
        // TODO Use SelectorFactory like in getEffectiveSelector
        logger.debug("Determining page class of %s", url);
        for (const name in this.configuration.pageClasses) {
            if (this.configuration.pageClasses.hasOwnProperty(name)) {
                const pageType = this.configuration.pageClasses[name];

                // TODO Could be cached?
                const regex = new RegExp(pageType.selector.value);
                if (regex.test(url)) {
                    logger.debug("Determining page class of %s finished. result=%s", url, name);
                    return pageType;
                }
            }
        }
        logger.warn("No matching page class for %s.", url);
        return false;
    }

    getEffectiveSelector(feature, types) {
        const selectorByFeature = feature.selector || {};

        if (selectorByFeature.value) {
            return SelectorFactory.create(selectorByFeature.type, selectorByFeature.value);
        } else {
            const type = types[feature.class] || {};
            const selectorByType = type.selector || {};
            if (selectorByType.value) {
                return SelectorFactory.create(selectorByType.type, selectorByType.value);
            } else {
                throw new Error(`No selector could be determined for feature ${feature.name}.`);
            }
        }
    }

    async storePage(siteId, page) {
        return this.httpRequestExecutor.put(`http://classification-storage-api:52629/sites/${siteId}/pages/${encodeURIComponent(page.url)}`, page)
            .then(() => {
                logger.debug("Finished processing of page %s", page.url);
            });
    }
};