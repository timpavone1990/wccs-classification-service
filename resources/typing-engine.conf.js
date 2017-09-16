"use strict;"
module.exports = {
    "pageTypes": {
        "Service": {
            "name": "Service",
            "selector": { "type": "UrlPatternSelector", "value": "\\\/service\\\/?$" },
            "properties": {
                "heading": { "name": "heading", "type": "PageHeading", "isCollection": false, "selector": {} },
                "subHeading": { "name": "subHeading", "type": "SectionHeading", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content > div.container > div.row > div > h4" } },
                "introduction": { "name": "introduction", "type": "Text", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content > div.container > div.row > div > div > p" } },
                "faqSections": { "name": "faqSections", "type": "FAQSection", "isCollection": true, "selector": {} },
                "closing": { "name": "closing", "type": "Text", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content div.panel-group + p" } }
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
                "links": { "name": "links", "type": "Link", "isCollection": true, "selector": {} }
            }
        },
        "FAQSection": {
            "name": "FAQSection",
            "selector": { "type": "CssSelector", "value": "#content div.panel-group" },
            "properties": {
                "title": { "name": "title", "type": "SectionHeading", "isCollection": false, "selector": {} },
                "entries": { "name": "entries", "type": "FAQEntry", "isCollection": true, "selector": {} }
            },
            "references": {
            }
        },
        "FAQEntry": {
            "name": "FAQEntry",
            "selector": { "type": "CssSelector", "value": "#content article.hrf-entry" },
            "properties": {
                "question": { "name": "question", "type": "FAQQuestion", "isCollection": false, "selector": {} },
                "answer": { "name": "answer", "type": "FAQAnswer", "isCollection": false, "selector": {} }
            },
            "references": {
            }
        },
        "FAQQuestion": {
            "name": "FAQQuestion",
            "selector": { "type": "CssSelector", "value": "#content h6.hrf-title" },
            "properties": {
            },
            "references": {
            }
        },
        "FAQAnswer": {
            "name": "FAQAnswer",
            "selector": { "type": "CssSelector", "value": "#content div.hrf-content" },
            "properties": {
            },
            "references": {
                "downloadsLink": { "name": "downloadsLink", "type": "Downloads", "isCollection": false, "selector": {} }
            }
        }
    },
    "referenceTypes": {
        "Link": {
            "name": "Link",
            "selector": { "type": "CssSelector", "value": "a" },
            "properties": {
            }
        },
        "Downloads": {
            "name": "Downloads",
            "selector": { "type": "UrlPatternSelector", "value": "http:\\\/\\\/www.fernuni-hagen.de\\\/KSW\\\/portale\\\/.+?\\\/service\\\/downloads\\\/?" },
            "properties": {
            }
        }
    }
};
