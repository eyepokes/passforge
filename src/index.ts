import { refresh, replaceTextWithLocaleText, toggleIcon } from "./browser";
import { SETTINGS_DEBOUNCE_DELAY, SETTINGS_MAX_HEIGHT, SETTINGS_MIN_HEIGHT } from "./constants";
import { selectors, settingsMap } from "./mapping";
import { StorageService } from "./services/storage";
import type { Settings } from "./types";
import { debounce } from "./utils";

let currentSettings: Settings;

const toggleLink: HTMLElement | null = document.querySelector(selectors.toggleLink);
const settingsList: HTMLElement | null = document.querySelector(selectors.settingsList);
const refreshLink: HTMLElement | null = document.querySelector(selectors.refreshLink);

if (toggleLink && settingsList) {
	toggleLink.addEventListener("click", (event) => {
		event.preventDefault();
		settingsList.style.maxHeight =
			settingsList.style.maxHeight === SETTINGS_MIN_HEIGHT
				? SETTINGS_MAX_HEIGHT
				: SETTINGS_MIN_HEIGHT;
		settingsList.classList.toggle("overflow-visible");
		settingsList.classList.toggle("overflow-hidden");
		toggleIcon(selectors.toggleIcon);
	});
}

async function main() {
	try {
		currentSettings = await StorageService.getSettings();
	} catch (error) {
		console.error("Failed to load settings:", error);
		// Continue with defaults if loading fails
		return;
	}

	// Debounced function to save settings and refresh password
	const debouncedSaveAndRefresh = debounce(async () => {
		try {
			await StorageService.saveSettings(currentSettings);
			refresh(currentSettings);
		} catch (error) {
			console.error("Failed to save settings:", error);
			// Still refresh with current settings in memory
			refresh(currentSettings);
		}
	}, SETTINGS_DEBOUNCE_DELAY);

	for (const setting in settingsMap) {
		const settingKey = setting as keyof Settings;
		const selector = document.querySelector<HTMLInputElement>(
			settingsMap[settingKey as keyof typeof settingsMap],
		);

		if (selector) {
			if (settingKey !== "length") {
				selector.checked = currentSettings[settingKey] as boolean;
			} else {
				// For length slider: update display in real-time while dragging
				const lengthDisplay = document.querySelector<HTMLElement>(selectors.length);
				selector.addEventListener("input", function (event) {
					event.preventDefault();
					if (lengthDisplay) {
						lengthDisplay.textContent = this.value;
					}
				});
			}

			//add listener for saving and regenerating password
			selector.addEventListener("change", function (event) {
				event.preventDefault();
				if (settingKey === "length") {
					currentSettings[settingKey] = parseInt(this.value, 10);
				} else {
					currentSettings[settingKey] = this.checked;
				}

				// Debounced save and refresh
				debouncedSaveAndRefresh();
			});
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

main().catch((error) => {
	console.error("Failed to initialize popup:", error);
});

document.addEventListener("DOMContentLoaded", () => {
	replaceTextWithLocaleText();
});
