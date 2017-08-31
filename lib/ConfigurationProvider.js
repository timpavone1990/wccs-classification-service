"use strict";

module.exports = class ConfigurationProvider {
    constructor(configurationFilePath) {
        this.configuration = require(configurationFilePath);
    }

    getConfiguration() {
        return this.configuration;
    }
};
