"use strict";

const uuidv4 = require("uuid/v4");

module.exports = class NodeWrapper {
    constructor(node, browserPage) {
        this.node = node;
        this.browserPage = browserPage;
    }

    async innerTextAndXPath() {
        if (this.node.evaluate) {
            return this.node.evaluate(element => {
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

                const values = [element.innerText, window.wcts.XPathCalculator.fromNode(element)];

                originalStyles.forEach(nodeStyle => {
                    nodeStyle.node.style.display = nodeStyle.display;
                    nodeStyle.node.style.visibility = nodeStyle.visibility;
                });

                return values;
            });
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
                    let aNode = node;
                    const originalStyles = [];
                    do {
                        originalStyles.push({"node": aNode, "display": aNode.style.display, "visibility": aNode.style.visibility});
                        aNode.style.display = "initial";
                        aNode.style.visibility = "initial";
                        aNode = aNode.parentNode;
                    } while (aNode !== document.body);

                    returnedNodes.push({
                        "id": id,
                        "index": index,
                        "innerText": node.innerText,
                        "xPath": window.wcts.XPathCalculator.fromNode(node)
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
};