import { defaultSettings, storageKey } from "../mapping";
import type { Settings } from "../types";

/**
 * Storage service for Chrome local storage operations
 * Provides a clean abstraction over chrome.storage.local API
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Service pattern uses static methods for stateless operations
export class StorageService {
	/**
	 * Retrieves settings from Chrome local storage
	 * @returns Promise resolving to Settings object (defaults if not found)
	 * @throws Error if storage operation fails
	 */
	static async getSettings(): Promise<Settings> {
		try {
			const storageSettings = await chrome.storage.local.get([storageKey]);
			const stored = storageSettings[storageKey];
			return stored ? { ...defaultSettings, ...stored } : defaultSettings;
		} catch (error) {
			console.error("Failed to retrieve settings from storage:", error);
			throw new Error("Unable to load settings. Please try again.");
		}
	}

	/**
	 * Saves settings to Chrome local storage
	 * @param settings - Settings object to save
	 * @throws Error if storage operation fails
	 */
	static async saveSettings(settings: Settings): Promise<void> {
		try {
			await chrome.storage.local.set({ [storageKey]: settings });
		} catch (error) {
			console.error("Failed to save settings to storage:", error);
			throw new Error("Unable to save settings. Please try again.");
		}
	}

	/**
	 * Clears all settings from Chrome local storage
	 * @throws Error if storage operation fails
	 */
	static async clearSettings(): Promise<void> {
		try {
			await chrome.storage.local.remove([storageKey]);
		} catch (error) {
			console.error("Failed to clear settings from storage:", error);
			throw new Error("Unable to clear settings. Please try again.");
		}
	}
}
