"use strict";

// TODO Duplicated in storage-api

const logger = require("./Logger");

module.exports = class HttpRequestExecutor {
    constructor(httpClient) {
        this.httpClient = httpClient
    }

    async put(url, payload) {
        logger.debug("Posting to %s: %s", payload.url, JSON.stringify(payload));
        const start = Date.now();
        return new Promise((resolve, reject) => {
            this.httpClient
                .put(url)
                .headers({"Accept": "application/json;charset=utf-8", "Content-Type": "application/json"})
                .send(payload)
                .end(response => {
                    logger.debug("Finished storing page %s in %d ms", payload.url, Date.now() - start);
                    if (response.ok) {
                        resolve(response.body);
                    } else {
                        reject(new Error(`PUT request to ${url} failed.\n${response.error}`));
                    }
                });
        });
    }
};
