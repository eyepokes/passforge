import {Settings} from "./types";

export const selectors = {
    toggleLink: "#toggleLink",
    toggleIcon: "#toggleIcon",
    settingsList: "#settingsList",
    refreshLink: "#refresh",
    status: "#status",
    password: "#password",
    "password-strength": "#password-strength",
    length: "#length"
}

export const settingsMap = {
    length: "#setting0",
    includeSpecialNoBrackets: "#setting1",
    includeSpecialBrackets: "#setting2",
    includeUppercase: "#setting3",
    includeNumbers: "#setting4"
}

export const tailwindMap = {
    "too-short": {
        border: "border-red-500",
        text: "text-red-500"
    },
    "weak": {
        border: "border-orange-500",
        text: "text-orange-500"
    },
    "moderate": {
        border: "border-yellow-500",
        text: "text-yellow-500"
    },
    "strong": {
        border: "border-green-500",
        text: "text-green-500"
    },
    "very-strong": {
        border: "border-indigo-500",
        text: "text-indigo-500"
    }
}

export const defaultSettings: Settings = {
    length: 8,
    includeSpecialNoBrackets: true,
    includeSpecialBrackets: false,
    includeUppercase: true,
    includeNumbers: true
}

export const storageKey = "passforge_settings";