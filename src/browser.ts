import { STATUS_FADE_TIMEOUT } from "./constants";
import { selectors, settingsMap, tailwindMap } from "./mapping";
import type { Settings } from "./types";
import { checkPasswordStrength, generatePassword } from "./utils";

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
		navigator.clipboard.writeText(text).catch(() => {
			// Clipboard API often fails in extension popups - use fallback silently
			copyTextToClipboard(text);
		});
	} catch {
		// Fallback for environments where Clipboard API is not available
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
	const password = generatePassword(settings);
	const statusText = chrome.i18n.getMessage("popup_copied_to_clipboard");
	const passwordStrength = checkPasswordStrength(password);

	const statusSelector: HTMLElement | null = document.querySelector(selectors.status);
	const passwordSelector: HTMLInputElement | null = document.querySelector(selectors.password);
	const lengthSelector: HTMLElement | null = document.querySelector(selectors.length);
	const lengthInputSelector: HTMLInputElement | null = document.querySelector(settingsMap.length);
	const passwordStrengthSelector: HTMLElement | null = document.querySelector(
		selectors["password-strength"],
	);

	if (
		passwordSelector &&
		lengthSelector &&
		lengthInputSelector &&
		statusSelector &&
		passwordStrengthSelector
	) {
		passwordSelector.value = password;
		lengthSelector.textContent = String(password.length);
		lengthInputSelector.value = String(password.length);
		statusSelector.textContent = statusText;
		showStatusText(statusSelector, STATUS_FADE_TIMEOUT);

		for (const item in tailwindMap) {
			passwordSelector.classList.remove(tailwindMap[item].border);
		}

		passwordSelector.classList.add(
			tailwindMap[passwordStrength.replace(/\s+/g, "-").toLowerCase()].border,
		);

		passwordStrengthSelector.textContent = chrome.i18n.getMessage(
			`password_strength_${passwordStrength.replace(/\s/, "_").toLowerCase()}`,
		);
		passwordStrengthSelector.className =
			tailwindMap[passwordStrength.replace(/\s+/g, "-").toLowerCase()].text;
		copyText(password);
	}
}

export function toggleIcon(selector: string) {
	const element = document.querySelector(selector);
	if (element) {
		const upIcon: HTMLElement | null = element.querySelector(selectors.iconFirst);
		const downIcon: HTMLElement | null = element.querySelector(selectors.iconSecond);

		if (!upIcon || !downIcon) {
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
	const elements = document.querySelectorAll(selectors.i18nElements);

	// Iterate over each element and replace its text with the corresponding translation
	if (elements.length > 0) {
		elements.forEach((element) => {
			const messageName = element.getAttribute("data-i18n");
			if (messageName) {
				const message = chrome.i18n.getMessage(messageName);
				if (message) {
					element.textContent = message;
				}
			}
		});
	}
}
