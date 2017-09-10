"use strict";

const uuidv4 = require("uuid/v4");

module.exports = class NodeWrapper {
    constructor(node, browserPage) {
        this.node = node;
        this.browserPage = browserPage;
    }

    async innerTextAndXPath() {
        if (this.node.evaluate) {
            return this.node.evaluate(element => [element.innerText, window.wcts.XPathCalculator.fromNode(element)])
        } else {
            return Promise.resolve([this.node.innerText, this.node.xPath]);
        }
    }

    async evaluate(action, ...args) {
        const evaluatePromise = this.node.evaluate ? this.node.evaluate(action, ...args) : this.browserPage.evaluate(action, this.node, ...args);
        return evaluatePromise.then(stringifiedArray => {
            return JSON.parse(stringifiedArray);
        });
    }

    async $$(selector) {
        return await this.evaluate((element, ...[selector, id]) => {
            try {
                console.log("In evaluate");
                console.log("element=" + element);
                console.log("selector=" + selector);
                console.log("id=" + id);
                if (!window.wcts.nodes) {
                    console.log("window.wcts.nodes not defined");
                    window.wcts.nodes = [];
                }
                const workingElement = element.querySelectorAll ? element : window.wcts.nodes[element.id][element.index];
                console.log("workingElement: " + workingElement);
                const nodes = workingElement.querySelectorAll(selector);
                console.log("nodes: " + nodes);
                window.wcts.nodes[id] = nodes;

                const returnedNodes = [];
                nodes.forEach((node, index) => {
                    returnedNodes.push({
                        "id": id,
                        "index": index,
                        "innerText": node.innerText,
                        "xPath": window.wcts.XPathCalculator.fromNode(node)
                    });
                });
                const stringifiedArray = JSON.stringify(returnedNodes);
                console.log("Nodes array: " + stringifiedArray);
                return stringifiedArray;
            } catch (e) {
                console.log(e);
            }
        }, selector, uuidv4());
    }
};