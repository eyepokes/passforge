import {refresh, toggleIcon, replaceTextWithLocaleText} from "./browser";
import {selectors, storageKey, settingsMap, defaultSettings} from "./mapping";
import {Settings} from "./types";

let currentSettings: Settings;

const toggleLink: HTMLElement | null = document.querySelector(selectors.toggleLink);
const settingsList: HTMLElement | null = document.querySelector(selectors.settingsList);
const refreshLink: HTMLElement | null = document.querySelector(selectors.refreshLink);


toggleLink!.addEventListener("click", (event) => {
    event.preventDefault();
    if(settingsList) {
        settingsList.style["max-height"] = settingsList!.style["max-height"] === "0px" ? "300px" : "0px";
        // toggleIcon.classList.toggle("fa-chevron-down");
        // toggleIcon.classList.toggle("fa-chevron-up");
        settingsList.classList.toggle("overflow-visible");
        settingsList.classList.toggle("overflow-hidden");
        toggleIcon(selectors.toggleIcon);
    }

});


async function main() {
    let storageSettings = await chrome.storage.local.get([storageKey]);

    currentSettings = (!storageSettings[storageKey] ? defaultSettings : storageSettings[storageKey]);
    for (let setting in settingsMap) {

        let selector = document.querySelector<HTMLInputElement>(settingsMap[setting]);
        if (selector) {
            selector.checked = currentSettings[setting];
            //add listener
            selector.addEventListener("change", async function (event) {
                event.preventDefault();

                if (setting === "length") {
                    currentSettings[setting] = parseInt(this.value, 10);
                } else {
                    currentSettings[setting] = this.checked;
                }
                await chrome.storage.local.set({[storageKey]: currentSettings});
                refresh(currentSettings);
            })
        }

    }
    refresh(currentSettings);

    if (refreshLink) {
        refreshLink.addEventListener("click", (event) => {
            event.preventDefault();
            refresh(currentSettings);
        });
    }

}


main().catch(error => {
    console.log(error.message);
});

document.addEventListener('DOMContentLoaded', () => {
    replaceTextWithLocaleText();
});