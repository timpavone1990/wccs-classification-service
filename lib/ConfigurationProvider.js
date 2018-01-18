"use strict";

const logger = require("./Logger");
const EMPTY_CLASSIFICATION_MODEL = {
    "pageClasses": {},
    "contentClasses": {},
    "referenceClasses": {}
};

module.exports = class ConfigurationProvider {
    constructor(configurationFilePath) {
        try {
            this.configuration = require(configurationFilePath);
        } catch (e) {
            logger.error(`Loading classification model from '${configurationFilePath}' failed. Will use an empty model\n`, e.stack);
            this.configuration = EMPTY_CLASSIFICATION_MODEL;
        }
    }

    getConfiguration() {
        return this.configuration;
    }
};
