import { writeFileSync } from "fs";

export const minimalArgs = ['--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain'];

export function Doc(title, style = undefined) {
    this._html = `<!DOCTYPE html><html><head><title> ${title} </title>${style != undefined ? `<link rel="stylesheet" href="${style}"/>` : ''}</head><body>`;

    this.$ = (tag, content, attribs = undefined) => {
        let _attribs = ""
        if (attribs != undefined) {
            for (const [key, value] of Object.entries(attribs)) {
                _attribs += `${key}="${value}"`
            }
        }

        this._html += `<${tag} ${_attribs}>`
        if (typeof content == "string") { this._html += `${content}</${tag}>`; } else {
            content();
            this._html += `</${tag}>`;
        }
    }

    this.raw = (s) => {
        this._html += s;
    }

    this.save = (file = undefined) => {
        this._html += `</body></html>`
        if (file == undefined) {
            console.log(this._html)
        } else {
            writeFileSync(file, this._html, { flag: "w" });
        }
    }
}

export function urlify(s) {
    return s.split(" ").join("")
}