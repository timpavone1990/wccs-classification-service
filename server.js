"use strict";

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const index = require('./routes/index');
const app = express();
const PORT = 44284;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/", index);
app.use((error, request, response, next) => {
    response
        .status(500)
        .json({ "error": error.message });
});

app.listen(PORT, () => {
    console.log(`Typing engine listening on port ${PORT}.`);
});
