import { readFileSync, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from "fs";
import { Doc, urlify } from "./utils.js";

const tree = JSON.parse(readFileSync("./files/output.json").toString());
const buildDir = "./build";

if (existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });
mkdirSync(`${buildDir}/assets`, { recursive: true });

readdirSync("./assets").forEach((v) => {
    cpSync(`./assets/${v}`, `${buildDir}/assets/${v}`)
})

let { $, save } = new Doc("Pacifica Code", "assets/style.css");

$("h1", "Pacifica Code");
$("ul", () => {
    tree.forEach(title => {
        if (title.idx == "") return;
        $("li", () => {
            $("a", `${title.idx} - ${title.name.replace("Utah", "Pacifica")}`, { href: `/${urlify(title.idx)}` });
        });
    });
});

tree.forEach(title => {
    let { $, save } = new Doc(`Pacifica Code ${title.idx}`, "assets/style.css");
    try {
        mkdirSync(`${buildDir}/${urlify(title.idx)}`);
    } catch {
        return;
    }

    $("h1", `${title.idx} - ${title.name}`);
    title.chapters.forEach(chapter => {
        let cdir = `${buildDir}/${urlify(title.idx)}/${urlify(chapter.idx)}`;
        let cdoc = new Doc(`Pacifica Code Chapter ${title.idx.split(" ")[0]}-${chapter.idx.split(" ")[0]}`, "/assets/style.css");

        mkdirSync(cdir);
        cdoc.$("h1", `${chapter.idx} - ${chapter.name}`);

        if (chapter.idx == "") return;
        $("li", () => {
            $("a", `${chapter.idx} - ${chapter.name}`, { href: `/${urlify(title.idx)}/${urlify(chapter.idx)}` });
        });

        if (chapter.sections != []) {
            chapter.sections.forEach((section) => {
                let idx = section.url.split("/").pop();
                idx = idx.substring(0, idx.indexOf(".html"));

                let sdoc = new Doc(`Pacifica Code Section ${idx}`, "/assets/style.css");
                sdoc.raw(section.content);
                sdoc.save(`${cdir}/${idx}.html`)

                cdoc.$("li", () => {
                    cdoc.$("a", `${section.idx} - ${section.name}`, { href: `/${urlify(title.idx)}/${urlify(chapter.idx)}/${idx}.html` });
                });
            });
        }

        if (chapter.parts != []) {
            chapter.parts.forEach((part) => {
                let pdir = `${cdir}/${urlify(part.idx)}`;
                mkdirSync(pdir);

                let pdoc = new Doc(`Pacifica Code Chapter ${title.idx.split(" ")[0]}-${chapter.idx.split(" ")[0]}-${part.idx.split(" ")[0]}`, "/assets/style.css");
                pdoc.$("h1", `${part.idx} - ${part.name}`);

                cdoc.$("li", () => {
                    cdoc.$("a", `${part.idx} - ${part.name}`, { href: `/${urlify(title.idx)}/${urlify(chapter.idx)}/${urlify(part.idx)}.html` });
                });

                part.sections.forEach((section) => {
                    let idx = section.url.split("/").pop();
                    idx = idx.substring(0, idx.indexOf(".html"));

                    let sdoc = new Doc(`Pacifica Code Section ${idx}`, "/assets/style.css");
                    sdoc.raw(section.content);
                    sdoc.save(`${pdir}/${idx}.html`);

                    pdoc.$("li", () => {
                        pdoc.$("a", `${section.idx} - ${section.name}`, { href: `/${urlify(title.idx)}/${urlify(chapter.idx)}/${urlify(part.idx)}/${idx}.html` });
                    });
                });

                pdoc.save(`${pdir}/index.html`);
            });
        }

        cdoc.save(`${cdir}/index.html`);
    });

    save(`${buildDir}/${urlify(title.idx)}/index.html`)
});

save(`${buildDir}/index.html`);