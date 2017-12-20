"use strict";

const uuidv4 = require("uuid/v4");

module.exports = class NodeWrapper {
    constructor(node, browserPage) {
        this.node = node;
        this.browserPage = browserPage;
    }

    // TODO Rename. Also returns destination
    async nodeInfos() {
        if (this.node.hasOwnProperty("innerText")) {
            // this.node is not a puppeteer ElementHandle
            return Promise.resolve({
                "innerText": this.node.innerText,
                "xPath": this.node.xPath,
                "destination": this.node.destination,
                "startOffset": this.node.startOffset,
                "endOffset": this.node.endOffset,
                "stopRecursion": this.node.stopRecursion
            });
        } else {
            return this.browserPage.evaluate(element => {
                try {
                    console.log("In nodeInfos");

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
                    console.log("Displaying all parent elements");
                    do {
                        originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                        aNode.style.display = "initial";
                        aNode.style.visibility = "initial";
                        aNode = aNode.parentNode;
                    } while (aNode !== document.body);
                    console.log("All elements set visible");

                    const destination = element.attributes.href || element.attributes.src || element.attributes.srcset;
                    const values = {
                        "innerText": element.innerText,
                        "xPath": window.wcts.XPathCalculator.fromNode(element),
                        "destination": ((destination && destination.value) || "")
                    };

                    originalStyles.forEach(nodeStyle => {
                        nodeStyle.node.style.display = nodeStyle.display;
                        nodeStyle.node.style.visibility = nodeStyle.visibility;
                    });

                    return values;
                } catch (e) {
                    console.log(e.message);
                }
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
                    console.log(e.message);
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
                console.log(e.message);
            }
        }, ...names);
    }

    async evaluateXPath(xPath) {
        const useDocumentAsContext = this.node === this.browserPage;
        const nodes = await this.evaluate((element, ...[xPath, useDocumentAsContext, id]) => {
            try {
                console.log("In evaluateXPath");
                console.log("element=" + element);
                console.log("xPath=" + xPath);
                console.log("useDocumentAsContext=" + useDocumentAsContext);
                console.log("id=" + id);

                let contextElement;
                if (useDocumentAsContext) {
                    contextElement = document;
                } else {
                    contextElement = element.querySelectorAll ? element : window.wcts.nodes[element.id][element.index];
                }

                if (contextElement) {
                    if (contextElement === document) {
                        console.log("Context Element: document");
                    } else {
                        console.log("Context element tag name: " + contextElement.tagName);
                        console.log("Context element id: " + contextElement.id);
                        if (contextElement.attributes && contextElement.attributes.class) {
                            console.log("Context element class: " + contextElement.attributes.class.value);
                        } else {
                            console.log("Context element has no class attribute");
                        }
                    }
                } else {
                    console.log("Context element not found.")
                }

                const xpathResult = document.evaluate(xPath, contextElement, null, XPathResult.ANY_TYPE, null);
                console.log("XPath evaluated");
                console.log("XPathResult: " + xpathResult.resultType);

                if (xpathResult.resultType === XPathResult.STRING_TYPE) {
                    console.log("Xpath result is of type string");
                    const stringValue = xpathResult.stringValue;
                    if (stringValue) {
                        const startOffset = (contextElement === document ? document.body : contextElement).innerText.indexOf(stringValue);
                        const endOffset = startOffset + stringValue.length;
                        const resultObject = [{
                            "innerText": stringValue,
                            "xPath": contextElement === document ? "/" : window.wcts.XPathCalculator.fromNode(contextElement),
                            "destination": stringValue,
                            "startOffset": startOffset,
                            "endOffset": endOffset,
                            "stopRecursion": true
                        }];
                        const stringifiedArray = JSON.stringify(resultObject);
                        console.log("Result array: " + stringifiedArray);
                        return stringifiedArray;
                    } else {
                        return "[]";
                    }
                } else if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE || xpathResult.resultType === XPathResult.NUMBER_TYPE) {
                    // NOT YET SUPPORTED
                    console.log("Xpath result is of type boolean or number, which are not supported yet.");
                    return "[]";
                } else {
                    console.log("Xpath result is of type node set");
                    const nodes = [];
                    let node = xpathResult.iterateNext();
                    while (node) {
                        console.log("Processing xpath result");
                        nodes.push(node);
                        node = xpathResult.iterateNext();
                    }
                    console.log("No more xpath results");
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
                            console.log("aNode: " + aNode);
                            originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                            aNode.style.display = "initial";
                            aNode.style.visibility = "initial";
                            aNode = aNode.parentNode;
                        } while (aNode !== document.body);

                        const destination = node.attributes.href || node.attributes.src || node.attributes.srcset;
                        console.log("Destination: " + (destination && destination.value || ""));
                        returnedNodes.push({
                            "id": id,
                            "index": index,
                            "innerText": node.innerText,
                            "xPath": window.wcts.XPathCalculator.fromNode(node),
                            "destination": ((destination && destination.value) || "")
                        });

                        console.log("Setting original styles");
                        originalStyles.forEach(nodeStyle => {
                            nodeStyle.node.style.display = nodeStyle.display;
                            nodeStyle.node.style.visibility = nodeStyle.visibility;
                        });
                        console.log("Original styles set");
                    });
                    const stringifiedArray = JSON.stringify(returnedNodes);
                    console.log("Nodes array: " + stringifiedArray);
                    return stringifiedArray;
                }
            } catch (e) {
                console.log(e.message);
            }
        }, xPath, useDocumentAsContext, uuidv4());

        const nodeWrappers = [];
        nodes.forEach(node => {
            nodeWrappers.push(new NodeWrapper(node, this.browserPage));
        });
        return nodeWrappers;
    }
};