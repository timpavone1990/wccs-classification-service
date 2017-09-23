"use strict";

const expect = require("chai").expect;
const BrowserPageProvider = require("./BrowserPageProvider");

describe("getPage", () => {
    function* nextPageId() {
        let i = 0;
        while (true) {
            yield i++;
        }
    }

    it("should manage pages", async () => {
        const pageIdGenerator = nextPageId();
        const browser = {
            newPage: function() {
                return `page_${pageIdGenerator.next().value}`
            }
        };
        const myBrowserManager = await BrowserPageProvider.create(browser);
        const page4 = await myBrowserManager.getPage();
        const page3 = await myBrowserManager.getPage();
        const page2 = await myBrowserManager.getPage();
        const page1 = await myBrowserManager.getPage();
        const page0 = await myBrowserManager.getPage();
        expect(page4).to.eql("page_4");
        expect(page3).to.eql("page_3");
        expect(page2).to.eql("page_2");
        expect(page1).to.eql("page_1");
        expect(page0).to.eql("page_0");

        const promise1 = myBrowserManager.getPage();
        const promise2 = myBrowserManager.getPage();
        myBrowserManager.releasePage(page2);
        myBrowserManager.releasePage(page4);
        const promise3 = myBrowserManager.getPage();
        myBrowserManager.releasePage(page0);

        const releasedPage = await promise1;
        const releasedPage2 = await promise2;
        const releasedPage3 = await promise3;
        expect(releasedPage).to.eq("page_2"); // Released pages a pushed and taken from the end
        expect(releasedPage2).to.eq("page_4");
        expect(releasedPage3).to.eq("page_0");
    });
});