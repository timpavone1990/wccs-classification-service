"use strict";

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const logger = require("./lib/Logger");
const classifications = require("./routes/classifications");
const contentClasses = require("./routes/content-classes");
const referenceClasses = require("./routes/reference-classes");
const app = express();
const PORT = 44284;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use((request, response, next) => {
    response.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods": "DELETE, GET, POST, PUT"
    });
    next();
});
app.use("/classifications", classifications);
app.use("/content-classes", contentClasses);
app.use("/reference-classes", referenceClasses);
app.use((error, request, response, next) => {
    response
        .status(500)
        .json({ "error": error.message });
});

app.listen(PORT, () => {
    logger.info(`Classification service started and listening on port ${PORT}.`);
});
