"use strict";

//const configuration = require("/conf/typing-engine.conf.js");
const configuration = require("../resources/typing-engine.conf.js");

module.exports = class ConfigurationProvider {
    getConfiguration() {
        return configuration;
    }
};