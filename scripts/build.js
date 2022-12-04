import fs from "fs";

const tree = JSON.parse(fs.readFileSync("./files/output.json").toString());

function pageStart(title) {
    return `<!DOCTYPE HTML><html><head><title>${title}</title><link rel="stylesheet" href="/assets/styles.css"/></head><body><ul>`
}

try { fs.rmdirSync("./build", { recursive: true, force: true }); } catch { }
fs.mkdirSync("./build");
fs.writeFileSync("./build/index.html", pageStart("Pacifica Code"))

fs.mkdirSync("./build/assets");
fs.readdirSync("./assets").forEach((file) => {
    fs.cpSync(`./assets/${file}`, `./build/assets/${file}`);
})

function urlify(i) {
    return i.split(" ").join("")
}

tree.forEach(title => {
    let titleDir = `./build/${urlify(title["idx"])}`;

    fs.mkdirSync(titleDir);
    fs.writeFileSync(`${titleDir}/index.html`, `${pageStart("Pacifica Code - Home")}<h2>${title["idx"]} - ${title["name"]}</h2><ul>`);

    title["chapters"].forEach((chapter) => {
        let chapterDir = `${titleDir}/${urlify(chapter["idx"])}`;

        fs.mkdirSync(chapterDir);
        fs.writeFileSync(`${chapterDir}/index.html`, `<h2>${chapter["name"]}</h2><ul>`, { flag: "a" });

        if (chapter['sections'].length > 0) {
            chapter['sections'].forEach((section) => {
                let idx = section['url'].split("/").pop();
                idx = idx.substring(0, idx.indexOf('.html'))

                fs.writeFileSync(`${chapterDir}/${idx}.html`, section['content']);
                fs.writeFileSync(`${chapterDir}/index.html`, `<li><a href="/${urlify(title['idx'])}/${urlify(chapter['idx'])}/${idx}.html"> ${section['idx']} - ${section['name']} </a></li>`, { flag: "a" });
            });
        }

        fs.writeFileSync(`${titleDir}/index.html`, `<li><a href=/${urlify(title['idx'])}/${urlify(chapter['idx'])}> ${chapter['idx']} - ${chapter['name']} </a> </li>`, { flag: "a" });
    });

    fs.writeFileSync(`${titleDir}/index.html`, `</ul>`, { flag: "a" });
    fs.writeFileSync("./build/index.html", `<li><a href="/${urlify(title['idx'])}/index.html">${title['idx']} - ${title['name']}</a></li>`, { flag: "a" })
});

fs.writeFileSync("./build/index.html", "</ul></body>", { flag: "a" })
