"use strict;"
module.exports = {
    "pageTypes": {
        "Service": {
            "name": "Service",
            "selector": { "type": "UrlPatternSelector", "value": "\\\/service\\\/?$" },
            "properties": {
                "heading": { "name": "heading", "type": "PageHeading", "selector": {} },
                "subHeading": { "name": "subHeading", "type": "SectionHeading", "selector": {} },
                "introduction": { "name": "introduction", "type": "Text", "selector": { "type": "CssSelector", "value": "#content > div.container > div.row > div > div > p" } }
            },
            "references": {
            }
        }
    },
    "contentTypes": {
        "PageHeading": {
            "name": "PageHeading",
            "selector": { "type": "CssSelector", "value": "#content h3" },
            "properties": {
            },
            "references": {
            }
        },
        "SectionHeading": {
            "name": "SectionHeading",
            "selector": { "type": "CssSelector", "value": "#content h4" },
            "properties": {
            },
            "references": {
            }
        },
        "Text": {
            "name": "Text",
            "selector": { "type": "CssSelector", "value": "p" },
            "properties": {
            },
            "references": {
            }
        }
    },
    "referenceTypes": {
    }
};

/*
"use strict";
const functions = [];
functions.push((document, createAnnotation) => createAnnotation(document, "#content h4 + div", "Introduction"));
functions.push((document, createAnnotation) => createAnnotation(document, "h4.panel-title", "FaqSectionTitle"));
functions.push((document, createAnnotation) => createAnnotation(document, "h6.hrf-title", "Question"));
functions.push((document, createAnnotation) => createAnnotation(document, "div.hrf-content", "Answer"));
functions.push((document, createAnnotation) => createAnnotation(document, "div.panel-group + p", "BottomText"));
functions.push((document, createAnnotation) => createAnnotation(document, "h4.entry-title a", "NewsDetailPage"));
exports.getFunctions = () => functions;
*/
