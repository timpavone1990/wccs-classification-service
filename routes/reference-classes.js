"use strict";

const logger = require("../lib/Logger");
const express = require('express');
const router = express.Router();
const configurationProvider = new (require("../lib/ConfigurationProvider"))("/conf/typing-engine.conf.js");

router.get('/', async (request, response, next) => {
    try {
        const classes = configurationProvider.getConfiguration().referenceTypes;
        const classesAsArray = Object.keys(classes).map(name => classes[name]);
        response.send({ "total": classesAsArray.length, "classes": classesAsArray });
    } catch (e) {
        logger.error(e.message);
        next(e);
    }
});

module.exports = router;