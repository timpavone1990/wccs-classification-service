/*
 * This class is based on https://github.com/tilgovi/simple-xpath-position
 *
 */

"use strict";

(() => {
    function nodeName(node) {
        switch (node.nodeName) {
            case '#text':
                return 'text()';
            case '#comment':
                return 'comment()';
            case '#cdata-section':
                return 'cdata-section()';
            default:
                return node.nodeName.toLowerCase();
        }
    }

    function nodePosition(node) {
        const name = node.nodeName;
        let position = 1;
        while ((node = node.previousSibling)) {
            if (node.nodeName === name) {
                position += 1;
            }
        }
        return position;
    }

    if (!window.wcts) {
        window.wcts = {};
    }
    window.wcts.XPathCalculator = class XPathCalculator {
        static fromNode(node) {
            let path = "/";
            while (node !== document) {
                path = `/${nodeName(node)}[${nodePosition(node)}]${path}`;
                node = node.parentNode;
            }
            return path.replace(/\/$/, '');
        }
    };
})();

