import {generatePassword, checkPasswordStrength} from "./utils";
import {Settings} from "./types";
import {selectors, settingsMap, tailwindMap} from "./mapping";

export function copyTextToClipboard(text: string) {
    const copyFrom = document.createElement("textarea");
    copyFrom.value = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand("copy");
    document.body.removeChild(copyFrom);
}

export function copyText(text: string) {
    try {
        navigator.clipboard.writeText(text).catch((e) => {
            console.log(e);
            copyTextToClipboard(text);
        });
    } catch (e) {
        console.log(e);
        copyTextToClipboard(text);
    }
}

export function showStatusText(statusSelector: HTMLElement, timeout: number) {
    statusSelector.style.opacity = "1";
    setTimeout(() => {
        statusSelector.style.opacity = "0";
    }, timeout);
}

export function refresh(settings: Settings) {
    let {length, includeSpecialNoBrackets, includeSpecialBrackets, includeUppercase, includeNumbers} = settings;
    let password = generatePassword(length, includeSpecialNoBrackets, includeSpecialBrackets, includeUppercase, includeNumbers);
    let statusText = chrome.i18n.getMessage("popup_copied_to_clipboard");
    let passwordStrength = checkPasswordStrength(password);
    console.log(passwordStrength);

    const statusSelector: HTMLElement | null = document.querySelector(selectors.status);
    const passwordSelector: HTMLInputElement | null = document.querySelector(selectors.password);
    const lengthSelector: HTMLElement | null = document.querySelector(selectors.length);
    const lengthInputSelector: HTMLInputElement | null = document.querySelector(settingsMap.length);
    const passwordStrengthSelector: HTMLElement | null = document.querySelector(selectors["password-strength"]);

    if(passwordSelector && lengthSelector && lengthInputSelector && statusSelector && passwordStrengthSelector) {
        passwordSelector.value = password;
        lengthSelector.textContent = String(password.length);
        lengthInputSelector.value = String(password.length);
        statusSelector.textContent = statusText;

        if (statusSelector) {
            showStatusText(statusSelector, 2000);
        }


        for (let item in tailwindMap) {
            passwordSelector.classList.remove(tailwindMap[item as keyof typeof tailwindMap].border);
        }

        passwordSelector.classList.add(tailwindMap[passwordStrength.replace(/\s+/g, "-").toLowerCase() as keyof typeof tailwindMap].border);

        passwordStrengthSelector.textContent = chrome.i18n.getMessage("password_strength_" + passwordStrength.replace(/\s/,"_").toLowerCase());
        passwordStrengthSelector.className = tailwindMap[passwordStrength.replace(/\s+/g, "-").toLowerCase() as keyof typeof tailwindMap].text;
        copyText(password);
    }
}

export function toggleIcon(selector:string) {
    let element = document.querySelector(selector);
    if (element) {
        let upIcon: HTMLElement | null = element.querySelector(".first");
        let downIcon: HTMLElement | null = element.querySelector(".second");

        if(!upIcon || !downIcon) {
            return;
        }

        if (upIcon.style.display === "none") {
            upIcon.style.display = "inline-block";
            downIcon.style.display = "none";
            //element.parentElement.classList.toggle("mb-4");
        } else {
            upIcon.style.display = "none";
            downIcon.style.display = "inline-block";
            //element.parentElement.classList.toggle("mb-4");
        }
    }
}

export function replaceTextWithLocaleText() {
    // Get all elements with a data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');

    // Iterate over each element and replace its text with the corresponding translation
    if (elements.length > 0) {
        elements.forEach((element) => {
            const messageName = element.getAttribute('data-i18n');
            if (messageName) {
                let message = chrome.i18n.getMessage(messageName);
                if (message) {
                    element.textContent = message;
                }
            }
        });
    }

}
