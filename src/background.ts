import { copyText } from "./browser";
import { BADGE_ERROR_ICON, BADGE_SUCCESS_ICON, BADGE_WHITE_COLOR } from "./constants";
import { StorageService } from "./services/storage";
import { generatePassword, recognizePasswordConditions, showBadge } from "./utils";

chrome.runtime.onInstalled.addListener(async () => {
	chrome.contextMenus.create({
		id: "passforge_create",
		title: "Generate and copy password",
		type: "normal",
		contexts: ["editable"],
	});

	chrome.contextMenus.create({
		id: "passforge_recognize",
		title: "Generate password based on selected criteria",
		type: "normal",
		contexts: ["selection"],
	});
});

async function copyPasswordToTab(password: string, tab: chrome.tabs.Tab | undefined) {
	if (tab && typeof tab.id === "number") {
		if (!tab.url?.startsWith("chrome://")) {
			await chrome.scripting
				.executeScript({
					target: { tabId: tab.id },
					func: copyText,
					args: [password],
				})
				.catch((e) => {
					console.error("Failed to execute copy script:", e);
				});

			await showBadge(BADGE_SUCCESS_ICON, tab.id, BADGE_WHITE_COLOR);
		} else {
			await showBadge(BADGE_ERROR_ICON, tab.id, BADGE_WHITE_COLOR);
		}
	}
}

chrome.contextMenus.onClicked.addListener(async (item, tab) => {
	switch (item.menuItemId) {
		case "passforge_create": {
			try {
				const currentSettings = await StorageService.getSettings();
				const password = generatePassword(currentSettings);
				await copyPasswordToTab(password, tab);
			} catch (error) {
				console.error("Failed to generate password:", error);
				if (tab && typeof tab.id === "number") {
					await showBadge(BADGE_ERROR_ICON, tab.id, BADGE_WHITE_COLOR);
				}
			}
			break;
		}
		case "passforge_recognize": {
			if (item.selectionText) {
				try {
					const recognizedSettings = recognizePasswordConditions(item.selectionText);
					const password = generatePassword(recognizedSettings);
					await copyPasswordToTab(password, tab);
				} catch (error) {
					console.error("Failed to generate password from text:", error);
					if (tab && typeof tab.id === "number") {
						await showBadge(BADGE_ERROR_ICON, tab.id, BADGE_WHITE_COLOR);
					}
				}
			}
			break;
		}
	}
});
