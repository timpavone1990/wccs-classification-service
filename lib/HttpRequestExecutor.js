"use strict";

// TODO Duplicated in storage-api

const logger = require("./Logger");

module.exports = class HttpRequestExecutor {
    constructor(httpClient) {
        this.httpClient = httpClient
    }

    async get(url) {
        logger.debug("Started downloading page %s", url);
        const start = Date.now();
        return new Promise((resolve, reject) => {
            this.httpClient
                .get(url)
                .end(response => {
                    logger.debug("Finished downloading page %s in %d ms", url, Date.now() - start);
                    if (response.ok) {
                        resolve(response.body);
                    } else {
                        reject(response.error);
                    }
                });
        });
    }

    async post(url, payload) {
        logger.debug("Started storing page %s", payload.url);
        const start = Date.now();
        return new Promise((resolve, reject) => {
            this.httpClient
                .post(url)
                .headers({"Accept": "application/json;charset=utf-8", "Content-Type": "application/json"})
                .send(payload)
                .end(response => {
                    logger.debug("Finished storing page %s in %d ms", payload.url, Date.now() - start);
                    if (response.ok) {
                        resolve(response.body);
                    } else {
                        reject(response.error);
                    }
                });
        });
    }
};
