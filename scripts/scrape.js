/**
 * This file generates a JSON structure representing the Utah Code and its contents. 
 * The JSON is then processed and converted into the HTML page rendered as the PC code.
 * 
 * This script takes a REALLY long time to run. If possible, changes to the JSON should be
 * written into the build script in order to prevent having to run this. 
 */
import fs from "fs";
import { minimalArgs } from "./utils.js";
import puppeteer from "puppeteer";
import { load } from "cheerio";

let $ = load(fs.readFileSync("./files/code_index.html").toString()); // Preload code page
var titles = []

// Fetch a list of titles
$("tr").each((_, e) => {
    let index = $(e).children("td").first().text();
    let name = $(e).children("td").last().text();
    let url = $(e).children("td").first().children("a").first().attr("href");

    titles.push({
        idx: index,
        name: name,
        url: url,
        chapters: []
    })
});

titles.splice(1, 2) // Titles contain two random entries. Should probably find a better way to do this.

async function main() {
    // Initialize Puppeteer
    const browser = await puppeteer.launch({ headless: false, userDataDir: 'files/userData', args: minimalArgs });
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
            req.abort();
        }
        else {
            req.continue();
        }
    });

    // Iterate through and store each title
    for (const v of titles) {
        if (v['url'] != undefined) {
            await page.goto(`${v['url']}`);
            await page.waitForXPath('//*[@id="content"]');

            // Parse title page and store chapters
            $ = load(await page.content()); // Reinitialize cheerio
            let children = $('table#childtbl > tbody').children('tr');

            for (let i = 0; i < children.length; i++) {
                let e = children.get(i); // although .each() on children would be faster, the async anon function causes a timeout

                let idx = $(e).children().first().text();
                let name = $(e).children().last().text();
                let url = $(e).children().first().children('a').attr('href');

                url = `https://le.utah.gov/xcode/${url.slice(3)}`
                v['chapters'].push({
                    idx: idx,
                    name: name,
                    url: url,
                    sections: [],
                    parts: []
                });
            }
        }
    }

    for (const title of titles) {
        // Iterate through chapters, grab sections
        for (const chapter of title['chapters']) {
            await page.goto(chapter['url']);
            await page.waitForXPath('//*[@id="content"]');

            $ = load(await page.content());
            let children = $('table#childtbl > tbody').children('tr');
            for (let i = 0; i < children.length; i++) {
                let e = children.get(i);

                let idx = $(e).children().first().text();
                let name = $(e).children().last().text();
                let url = $(e).children().first().children('a').attr('href');

                url = `https://le.utah.gov/xcode/${url.slice(6)}`;
                if (idx.startsWith('Section')) {
                    chapter['sections'].push({
                        idx: idx,
                        name: name,
                        url: url,
                        content: ""
                    });
                } else if (idx.startsWith('Part')) {
                    chapter['parts'].push({
                        idx: idx,
                        name: name,
                        url: url,
                        sections: []
                    });
                }
            }

            if (chapter['sections'] != []) {
                for (let i = 0; i < chapter['sections'].length; i++) {
                    const sec = chapter['sections'][i];

                    await page.goto(sec['url']);
                    await page.waitForXPath('//*[@id="content"]');

                    $ = load(await page.content());
                    chapter['sections'][i]['content'] = $('#secdiv').html();
                }
            }

            if (chapter['parts'] != []) {
                for (let i = 0; i < chapter['parts'].length; i++) {
                    const part = chapter['parts'][i];

                    await page.goto(part['url']);
                    await page.waitForXPath('//*[@id="content"]');

                    $ = load(await page.content());
                    let children = $('table#childtbl > tbody').children('tr');

                    for (let j = 0; j < children.length; j++) {
                        let e = children.get(j);

                        let idx = $(e).children().first().text();
                        let name = $(e).children().last().text();
                        let url = $(e).children().first().children('a').attr('href');

                        url = `https://le.utah.gov/xcode/${url.slice(6)}`;

                        await page.goto(url);
                        await page.waitForXPath('//*[@id="content"]');

                        $ = load(await page.content());

                        part['sections'].push({
                            idx: idx,
                            name: name,
                            url: url,
                            content: $("#secdiv").html()
                        })
                    }
                }
            }
        }
    }

    await browser.close();

    fs.writeFileSync("./files/output.json", JSON.stringify(titles));
    return new Promise((r, _) => r());
}

main();