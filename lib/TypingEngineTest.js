"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const fs = require("fs");

const puppeteer = require("puppeteer");

const configurationProvider = new (require("./ConfigurationProvider"))("../resources/typing-engine.conf");
const TypingEngine = require("./TypingEngine");
const HttpRequestExecutor = require("./HttpRequestExecutor");

const testJob = {
    "tasks": [
        {
            "site": {
                "id": "site01",
                "displayName": "Site 01"
            },
            "pages": [
                `file://${process.cwd()}/resources/babw/service`/*,
                "http://www.fernuni-hagen.de/KSW/portale/babw123/service/"*/
            ]
        }/*,
        {
            "site": {
                "id": "site02",
                "displayName": "Site 02"
            },
            "pages": [
                "http://www.fernuni-hagen.de/KSW/portale/qwertz/service/",
                "http://www.fernuni-hagen.de/KSW/portale/qwertz123/service/"
            ]
        }*/
    ]
};

describe("#processJob", () => {

    let browser;

    before(async () => {
        browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
    });

    after(() => {
        browser.close();
    });

    it("should type all pages correctly", async () => {
        const httpRequestExecutor = new HttpRequestExecutor();
        const postStub = sinon.stub(httpRequestExecutor, "post").callsFake(() => {
            return Promise.resolve();
        });

        //const browser = await puppeteer.launch({ "args": ["--no-sandbox"], "userDataDir": "/tmp" });
        const typingEngine = new TypingEngine(httpRequestExecutor, configurationProvider, browser);
        const result = await typingEngine.processJob(testJob);

        expect(result).to.eql("dummy");
        expect(postStub.args[0][0]).to.eql("http://storage-api:52629/sites/site01/pages");
        expect(postStub.args[0][1]).to.eql({
            "type": "Service",
            "url": `file://${process.cwd()}/resources/babw/service`,
            "properties": {
                "heading": {
                    "type": "PageHeading",
                    "content": "Service",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/h3[1]","offset": 0 },
                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/h3[1]", "offset": 7 }
                    },
                    "properties": {}
                },
                "subHeading": {
                    "type": "SectionHeading",
                    "content": "Fragen und Antworten zum B.A. Bildungswissenschaft (F.A.Q.s)",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/h4[1]", "offset": 0 },
                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/h4[1]", "offset": 60 }
                    },
                    "properties": {}
                },
                "introduction": {
                    "type": "Text",
                    "content": "Viele Fragen zum B.A. Bildungswissenschaft klären sich durch die Lektüre dieser FAQs! Bitte machen Sie zunächst von diesem Angebot Gebrauch, bevor Sie sich an die Studienberatung wenden. \n(Stand: 06/2015)",
                    "selector": {
                        "type": "RangeSelector",
                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[1]/p[1]", "offset": 0, },
                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[1]/p[1]", "offset": 204 },
                    },
                    "properties": {}
                },
                "faqSections": [
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]", "offset": 0, },
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "type": "SectionHeading",
                                "content": "Inhaltliche Ausrichtung",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/h4[1]", "offset": 23 },
                                },
                                "properties": {}
                            },
                            "entries": [
                                {
                                    "type": "FAQEntry",
                                    "selector": {
                                        "type": "RangeSelector",
                                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]", "offset": 0 },
                                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]", "offset": 0 }
                                    },
                                    "properties": {
                                        "question": {
                                            "type": "FAQQuestion",
                                            "content": "Ich interessiere mich für den Bachelorstudiengang Bildungswissenschaft. Handelt es sich dabei um ein erziehungswissenschaftliches Studium?",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": {
                                                    "type": "XPathSelector",
                                                    "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]/h6[1]",
                                                    "offset": 0
                                                },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]/h6[1]", "offset": 138 }
                                            },
                                            "properties": {}
                                        },
                                        "answer": {
                                            "type": "FAQAnswer",
                                            "content": "Ja. Im Zentrum des Bachelorstudiengangs Bildungswissenschaft steht die Reflexion und Gestaltung von Erziehungs- und Bildungsprozessen. So sind die Module auf typische erziehungswissenschaftliche Themenfelder wie Bildung und Gesellschaft; interkulturelle Erziehungswissenschaft; Bildung, Arbeit und Beruf; Allgemeine Didaktik, Mediendidaktik und Medienpädagogik oder empirische Bildungsforschung ausgerichtet. Ergänzt wird das Curriculum durch Anteile aus der Psychologie und Soziologie. Die Bezeichnung Bachelor „Bildungswissenschaft“ wurde auch deshalb gewählt, weil das lebenslange Lernen als Bildungsaufgabe über die gesamte Lebenszeit betont wird.\n\nNeben dem Fachwissen erwerben Sie in diesem Studiengang Kompetenzen, um Tätigkeiten in gesellschaftlichen und pädagogischen Handlungsfeldern auszuüben. Nach Abschluss des Studiums sollen Sie gegenwärtige Bildungsaufgaben in beruflichen Kontexten ermitteln und gestalten, neue Medien in der beruflichen Praxis anwenden und die Veränderungen der Kommunikationsformen und -inhalte durch den Einsatz neuer Medien reflektieren können.\n\n",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]/div[1]", "offset": 0, },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[1]/div[1]", "offset": 1084 }
                                            },
                                            "properties": {}
                                        }
                                    }
                                },
                                {
                                    "type": "FAQEntry",
                                    "selector": {
                                        "type": "RangeSelector",
                                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]", "offset": 0 },
                                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]", "offset": 0 }
                                    },
                                    "properties": {
                                        "question": {
                                            "type": "FAQQuestion",
                                            "content": "Ist der Studiengang international anerkannt?",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]/h6[1]", "offset": 0 },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]/h6[1]", "offset": 44 }
                                            },
                                            "properties": {}
                                        },
                                        "answer": {
                                            "type": "FAQAnswer",
                                            "content": "Ja. Denn der Studiengang richtet sich nach den Rahmenvorgaben der Kultusministerkonferenz, wonach ein Bachelorstudium sechs Semester dauern und 5400 Arbeitsstunden umfassen soll und dementsprechend 180 ECTS-Punkte für modulbezogene Prüfungsleistungen sowie die Bachelor-Arbeit angerechnet werden. Es gibt also auch keine Zwischenprüfungen mehr, sondern die Prüfungen sind alle modulbezogen.\n\n",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]/div[1]", "offset": 0 },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[2]/div[1]", "offset": 392 }
                                            },
                                            "properties": {}
                                        }
                                    }
                                },
                                {
                                    "type": "FAQEntry",
                                    "selector": {
                                        "type": "RangeSelector",
                                        "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]", "offset": 0 },
                                        "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]", "offset": 0 }
                                    },
                                    "properties": {
                                        "question": {
                                            "type": "FAQQuestion",
                                            "content": "Ist der BA Bildungswissenschaft vergleichbar mit Sozialpädagogik oder Sozialer Arbeit?",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]/h6[1]", "offset": 0 },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]/h6[1]", "offset": 86 }
                                            },
                                            "properties": {}
                                        },
                                        "answer": {
                                            "type": "FAQAnswer",
                                            "content": "Vergleichbar schon, aber nicht äquivalent: Zwar gibt es inhaltliche Übereinstimmungen, aber der BA Bildungswissenschaft ist stärker als ein Studiengang in Sozialpädagogik oder Sozialer Arbeit auf die Wissenschaft ausgerichtet, z.B. indem die empirischen Forschungsmethoden und wissenschaftliches Arbeiten eine große Rolle spielen. Der Praxisanteil ist dagegen viel geringer; auch sozialrechtliche Fragen werden im Studium der Bildungswissenschaft nicht erörtert.\n\nWenn Sie eine Stelle antreten möchten, die von der Ausrichtung her eigentlich für Absolventinnen und Absolventen der Sozialarbeit bzw. Sozialpädagogik vorgesehen ist, müssten Sie mit dem zukünftigen Arbeitgeber besprechen, inwiefern dies möglich ist.\n\n",
                                            "selector": {
                                                "type": "RangeSelector",
                                                "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]/div[1]", "offset": 0 },
                                                "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[1]/div[1]/article[3]/div[1]", "offset": 716 }
                                            },
                                            "properties": {}
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[3]", "offset": 0 },
                            "endSelector": { "offset": 0, "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[3]" },
                            "type": "RangeSelector"
                        },
                        "properties": {
                            "title": {
                                "type": "SectionHeading",
                                "content": "Berufsfeldorientierung",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[3]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[3]/div[1]/div[1]/h4[1]", "offset": 22 }
                                },
                                "properties": {}
                            }
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[4]", "offset": 0 },
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[4]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "type": "SectionHeading",
                                "content": "Zulassungsvoraussetzungen",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[4]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[4]/div[1]/div[1]/h4[1]", "offset": 25 }
                                },
                                "properties": {}
                            }
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[5]", "offset": 0 },
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[5]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "content": "Anerkennungen",
                                "type": "SectionHeading",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[5]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[5]/div[1]/div[1]/h4[1]", "offset": 13 }
                                },
                                "properties": {}
                            }
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[6]", "offset": 0 },
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[6]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "type": "SectionHeading",
                                "content": "Studienorganisation",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[6]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[6]/div[1]/div[1]/h4[1]", "offset": 19 }
                                },
                                "properties": {}
                            }
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[7]", "offset": 0 },
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[7]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "type": "SectionHeading",
                                "content": "Prüfungen",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[7]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[7]/div[1]/div[1]/h4[1]", "offset": 9 }
                                },
                                "properties": {}
                            }
                        }
                    },
                    {
                        "type": "FAQSection",
                        "selector": {
                            "type": "RangeSelector",
                            "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[8]", "offset": 0 },
                            "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[8]", "offset": 0 }
                        },
                        "properties": {
                            "title": {
                                "content": "BA-Abschlussarbeit",
                                "type": "SectionHeading",
                                "selector": {
                                    "type": "RangeSelector",
                                    "startSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[8]/div[1]/div[1]/h4[1]", "offset": 0 },
                                    "endSelector": { "type": "XPathSelector", "value": "/html[1]/body[1]/div[1]/section[2]/div[1]/div[1]/div[2]/div[8]/div[1]/div[1]/h4[1]", "offset": 18 }
                                },
                                "properties": {}
                            }
                        }
                    }
                ]
            },
            "references": {}
        });
    }).timeout(60000);
});

describe("#getEffectivePropertySelector", () => {
    it("should throw if no selector was specified", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" } };
        expect(() => {
            typingEngine.getEffectivePropertySelector(property);
        }).to.throw();
    });

    it("should fallback to the selector specified by the type", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "" }, "type": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("#content h3");
    });

    it("should use the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "div > p" } };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("div > p");
    });

    it("should prefer the selector specified by the property", () => {
        const typingEngine = new TypingEngine(null, configurationProvider);
        const property = { "selector": { "value": "div > span" }, "type": "PageHeading" };
        const effectiveSelector = typingEngine.getEffectivePropertySelector(property);
        expect(effectiveSelector).to.eql("div > span");
    });
});