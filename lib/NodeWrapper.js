"use strict";

const uuidv4 = require("uuid/v4");

module.exports = class NodeWrapper {
    constructor(node, browserPage) {
        this.node = node;
        this.browserPage = browserPage;
    }

    // TODO Rename. Also returns destination
    async innerTextAndXPath() {
        if (this.node.innerText) {
            // this.node is not a puppeteer ElementHandle
            return Promise.resolve([this.node.innerText, this.node.xPath, this.node.destination]);
        } else {
            return this.browserPage.evaluate(element => {
                /*
                 * TODO WCTS-17
                 * Due to https://html.spec.whatwg.org/#the-innertext-idl-attribute
                 * we need to make every parent element of the selected node visible.
                 * Otherwise innerText will return textContent.
                 * Afterwards we need to restore the original state of each node.
                 * We need to do it here, as well as in #$$(selector) (below).
                 * Note that child elements are not made visible!
                 * Their content will therefore not be included.
                 */
                let aNode = element;
                const originalStyles = [];
                do {
                    originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                    aNode.style.display = "initial";
                    aNode.style.visibility = "initial";
                    aNode = aNode.parentNode;
                } while (aNode !== document.body);

                const destination = element.attributes.href || element.attributes.src || element.attributes.srcset;
                const values = [element.innerText, window.wcts.XPathCalculator.fromNode(element),  ((destination && destination.value) || "") ];

                originalStyles.forEach(nodeStyle => {
                    nodeStyle.node.style.display = nodeStyle.display;
                    nodeStyle.node.style.visibility = nodeStyle.visibility;
                });

                return values;
            }, this.node);
        }
    }

    async evaluate(action, ...args) {
        const element = this.browserPage === this.node ? null : this.node;
        const evaluatePromise = this.browserPage.evaluate(action, element, ...args);
        return evaluatePromise.then(stringifiedArray => {
            return JSON.parse(stringifiedArray);
        });
    }

    async $$(selector) {
        let nodes;
        if (this.node === this.browserPage) {
            nodes = await this.node.$$(selector);
        } else {
            nodes = await this.evaluate((element, ...[selector, id]) => {
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
                        let aNode = node;
                        const originalStyles = [];
                        do {
                            originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                            aNode.style.display = "initial";
                            aNode.style.visibility = "initial";
                            aNode = aNode.parentNode;
                        } while (aNode !== document.body);

                        const destination = node.attributes.href || node.attributes.src || node.attributes.srcset;
                        returnedNodes.push({
                            "id": id,
                            "index": index,
                            "innerText": node.innerText,
                            "xPath": window.wcts.XPathCalculator.fromNode(node),
                            "destination": ((destination && destination.value) || "")
                        });

                        originalStyles.forEach(nodeStyle => {
                            nodeStyle.node.style.display = nodeStyle.display;
                            nodeStyle.node.style.visibility = nodeStyle.visibility;
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

        const nodeWrappers = [];
        nodes.forEach(node => {
            nodeWrappers.push(new NodeWrapper(node, this.browserPage));
        });
        return nodeWrappers;
    }

    async attributeValues(...names) {
        if (this.node === this.browserPage) {
            // TODO
            throw new Error("Page object does not have attributes");
        }
        return this.evaluate((element, ...attributeNames) => {
            try {
                const workingElement = element.querySelectorAll ? element : window.wcts.nodes[element.id][element.index];
                const attributeValues = {};

                attributeNames.forEach(name => {
                    console.log("Looking for attribute " + name);
                    const attribute = workingElement.attributes[name];
                    attributeValues[name] = attribute && attribute.value || "";
                });
                const stringifiedResult = JSON.stringify(attributeValues);
                console.log("Attribute values: " + stringifiedResult);
                return stringifiedResult;
            } catch (e) {
                console.log(e);
            }
        }, ...names);
    }

    async evaluateXPath(xPath) {
        const useDocumentAsContext = this.node === this.browserPage;
        const nodes = await this.evaluate((element, ...[xPath, useDocumentAsContext, id]) => {
            try {
                const workingElement = element.querySelectorAll ? element : window.wcts.nodes[element.id][element.index];
                const contextElement = useDocumentAsContext ? document : workingElement;
                const nodeIterator = document.evaluate(xPath, contextElement, null, XPathResult.ANY_TYPE, null);

                const nodes = [];
                let node = nodeIterator.iterateNext();
                while (node) {
                    nodes.push(node);
                    node = nodeIterator.iterateNext();
                }
                if (!window.wcts.nodes) {
                    console.log("window.wcts.nodes not defined");
                    window.wcts.nodes = [];
                }
                window.wcts.nodes[id] = nodes;

                const returnedNodes = [];
                nodes.forEach((node, index) => {
                    let aNode = node;
                    const originalStyles = [];
                    do {
                        originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                        aNode.style.display = "initial";
                        aNode.style.visibility = "initial";
                        aNode = aNode.parentNode;
                    } while (aNode !== document.body);

                    const destination = node.attributes.href || node.attributes.src || node.attributes.srcset;
                    returnedNodes.push({
                        "id": id,
                        "index": index,
                        "innerText": node.innerText,
                        "xPath": window.wcts.XPathCalculator.fromNode(node),
                        "destination": ((destination && destination.value) || "")
                    });

                    originalStyles.forEach(nodeStyle => {
                        nodeStyle.node.style.display = nodeStyle.display;
                        nodeStyle.node.style.visibility = nodeStyle.visibility;
                    });
                });
                const stringifiedArray = JSON.stringify(returnedNodes);
                console.log("Nodes array: " + stringifiedArray);
                return stringifiedArray;
            } catch (e) {
                console.log(e);
            }
        }, xPath, useDocumentAsContext, uuidv4());

        const nodeWrappers = [];
        nodes.forEach(node => {
            nodeWrappers.push(new NodeWrapper(node, this.browserPage));
        });
        return nodeWrappers;
    }
};