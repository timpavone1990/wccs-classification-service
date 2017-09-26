"use strict;"
module.exports = {
    "pageTypes": {
        "Service": {
            "name": "Service",
            "selector": { "type": "UrlPatternSelector", "value": "\\\/service\\\/?$" },
            "properties": {
                "header": { "name": "header", "type": "Header", "isCollection": false, "selector": {} },
                "portal": { "name": "portal", "type": "Portal", "isCollection": false, "selector": {} },
                "heading": { "name": "heading", "type": "PageHeading", "isCollection": false, "selector": {} },
                "subHeading": { "name": "subHeading", "type": "SectionHeading", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content > div.container > div.row > div > h4" } },
                "introduction": { "name": "introduction", "type": "Text", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content > div.container > div.row > div > div > p" } },
                "faqSections": { "name": "faqSections", "type": "FAQSection", "isCollection": true, "selector": {} },
                "closing": { "name": "closing", "type": "Text", "isCollection": false, "selector": { "type": "CssSelector", "value": "#content div.panel-group + p" } }
            },
            "references": {
                "servicePages": { "name": "servicePages", "type": "ServicePage", "isCollection": true, "selector": {} },
                "siteMainPages": { "name": "siteMainPages", "type": "FernUniInternalLink", "isCollection": true, "selector": { "type": "XPathSelector", "value": "\/\/ul[@id=\"menu-mainmenue\"]\/li\/a" } }
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
                "fernUniLinks": { "name": "fernUniLinks", "type": "FernUniInternalLink", "isCollection": true, "selector": {} }
            }
        },
        "Portal": {
            "name": "Portal",
            "selector": { "type": "CssSelector", "value": "section#inner-headline a.content" },
            "properties": {
            },
            "references": {
                "homepage": { "name": "homepage", "type": "FernUniInternalLink", "isCollection": false, "selector": { "type": "XPathSelector", "value": "." } }
            }
        },
        "Header": {
            "name": "Header",
            "selector": { "type": "CssSelector", "value": "header" },
            "properties": {
                "fernUni": { "name": "fernUni", "type": "Brand", "isCollection": false, "selector": { "type": "XPathSelector", "value": "\/\/a[@class=\"navbar-brand\"]" } }
            },
            "references": {
            }
        },
        "Brand": {
            "name": "Brand",
            "selector": {},
            "properties": {
            },
            "references": {
                "homepage": { "name": "homepage", "type": "FernUniInternalLink", "isCollection": false, "selector": { "type": "XPathSelector", "value": "." } },
                "logo": { "name": "logo", "type": "Image", "isCollection": false, "selector": { "type": "XPathSelector", "value": ".\/img" } }
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
                "fernUniLinks": { "name": "fernUniLinks", "type": "FernUniInternalLink", "isCollection": true, "selector": {} }
            }
        }
    },
    "referenceTypes": {
        "Image": {
            "name": "Image",
            "selector": { "type": "CssSelector", "value": "img" }
        },
        "FernUniInternalLink": {
            "name": "FernUniInternalLink",
            "selector": { "type": "UrlPatternSelector", "value": "^((http(s?):\\\/\\\/www\\.fernuni-hagen\\.de\\\/?)|\\\/).*$" }
        },
        "ServicePage": {
            "name": "ServicePage",
            "selector": { "type": "CssSelector", "value": "ul#menu-service a" }
        }
    }
};
