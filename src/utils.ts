import {Settings} from "./types";
import ColorArray = chrome.action.ColorArray;

/**
 * Generates password string
 * @param length
 * @param includeSpecialNoBrackets
 * @param includeSpecialBrackets
 * @param includeUppercase
 * @param includeNumbers
 * @returns {string}
 */
export function generatePassword(length: number, includeSpecialNoBrackets: boolean, includeSpecialBrackets: boolean, includeUppercase: boolean, includeNumbers: boolean): string {
    // Initialize an empty string to store the generated password
    let password: string = "";

    // Set to default if something wrong with the length number
    if (length < 0 || length > 50) {
        length = 8;
    }

    // Define the characters that can be used in the password
    const specialCharactersNoBrackets: string = "!@#$%^&*_+-=;':\",.?/\\`";
    const specialCharactersBrackets: string = "{}()<>[]";
    const lowercase: string = "abcdefghijklmnopqrstuvwxyz";
    const uppercase: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers: string = "0123456789";

    // Initialize the possible characters string with lowercase characters
    let possibleCharacters: string = lowercase;

    // Add the special characters to the possible characters string if the includeSpecialNoBrackets argument is true
    if (includeSpecialNoBrackets) possibleCharacters += specialCharactersNoBrackets;

    // Add the special bracket characters to the possible characters string if the includeSpecialBrackets argument is true
    if (includeSpecialBrackets) possibleCharacters += specialCharactersBrackets;

    // Add the uppercase characters to the possible characters string if the includeUppercase argument is true
    if (includeUppercase) possibleCharacters += uppercase;

    // Add the numbers to the possible characters string if the includeNumbers argument is true
    if (includeNumbers) possibleCharacters += numbers;

    // Generate the password by adding random characters from the possible characters string to the password string
    while (password.length < length) {
        password += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

        // If the includeUppercase argument is true and the password doesn't contain an uppercase character, add a random uppercase character
        if (includeUppercase && !/[A-Z]/.test(password)) {
            password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        }

        // If the includeNumbers argument is true and the password doesn't contain a number, add a random number
        if (includeNumbers && !/\d/.test(password)) {
            password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }

        // If the includeSpecialNoBrackets argument is true and the password doesn't contain a special character without brackets, add a random special character without brackets
        if (includeSpecialNoBrackets && !/[!@#$%^&*_+\-=;':",.?\/\\`]/.test(password)) {
            password += specialCharactersNoBrackets.charAt(Math.floor(Math.random() * specialCharactersNoBrackets.length));
        }

        // If the includeSpecialBrackets argument is true and the password doesn't contain a special character with brackets, add a random special character with brackets
        if (includeSpecialBrackets && !/[{}()<>\[\]]/.test(password)) {
            password += specialCharactersBrackets.charAt(Math.floor(Math.random() * specialCharactersBrackets.length));
        }
    }

    // Convert the password string to an array, shuffle it, and then convert it back to a string
    password = password.split("").sort(() => Math.random() - 0.5).join("");
    // Return the generated password
    return password;
}

/**
 * Checks password string strength
 * @param password
 * @returns {string}
 */
export function checkPasswordStrength(password: string): string {
    let strength: number = 0;

    if (password.length < 8) {
        return 'Too short';
    }

    if (/[a-z]/.test(password)) {
        strength += 1;
    }

    if (/[A-Z]/.test(password)) {
        strength += 1;
    }

    if (/\d/.test(password)) {
        strength += 1;
    }

    if (/[!@#$%^&*_+\-=;':",.?\/\\`{}()<>\[\]]/.test(password)) {
        strength += 1;
    }

    if (password.length >= 16) {
        strength += 1;
    }

    // Check for repeating characters
    let repeatCount = 0;
    for (let i = 0; i < password.length; i++) {
        let char = password.charAt(i);
        repeatCount = password.indexOf(char, i + 1) !== -1 ? repeatCount + 1 : repeatCount;
        if (repeatCount >= 2) {
            strength -= 1;
            break;
        }
    }

    // Check for sequential characters (e.g. "abc" or "1234")
    for (let i = 0; i < password.length - 2; i++) {
        let c1 = password.charCodeAt(i);
        let c2 = password.charCodeAt(i + 1);
        let c3 = password.charCodeAt(i + 2);
        if (c1 + 1 === c2 && c2 + 1 === c3) {
            strength -= 2;
            break;
        }
    }

    switch (strength) {
        default:
        case 0:
        case 1:
            return 'Weak';
        case 2:
            return 'Moderate';
        case 3:
        case 4:
            return 'Strong';
        case 5:
            return 'Very Strong';
    }

}

export function sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

export async function showBadge(text: string, tabId: number, color: ColorArray, fadeDelay: number) {
    await chrome.action.setBadgeBackgroundColor({tabId: tabId, color: color});
    await chrome.action.setBadgeText({tabId: tabId, text: text});
    // await chrome.action.setTitle({
    //     title: "Copied",
    //     tabId: tabId
    // });
    await sleep(fadeDelay);
    await chrome.action.setBadgeText({tabId: tabId, text: ""});
}

export function recognizePasswordConditions(input: string): Settings {

    const regexes = [
        /\d+/g, // length regex
        /(?:symbol|special (character)?)s?/i, // special characters regex
        /(?:uppercase|upper case|capital|upper)/i, // uppercase letters regex
        /(?:number|numeral|digit)s?/i, // numbers regex
        /(?:include|contains?)\s+([^,]+?(?:(?=(?:,|$))|\(.+?\)))/gi // all other conditions regex
    ];

    const numbersMap: { [K: string]: number } = {
        'one': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
        'seven': 7,
        'eight': 8,
        'nine': 9,
        'ten': 10,
        'eleven': 11,
        'twelve': 12,
        'thirteen': 13,
        'fourteen': 14,
        'fifteen': 15,
        'sixteen': 16,
        'seventeen': 17,
        'eighteen': 18,
        'nineteen': 19,
        'twenty': 20,
        'twenty one': 21,
        'twenty two': 22,
        'twenty three': 23,
        'twenty four': 24,
        'twenty five': 25,
        'twenty six': 26,
        'twenty seven': 27,
        'twenty eight': 28,
        'twenty nine': 29,
        'thirty': 30
    };

    const conditions: Settings = {
        length: 8,
        includeSpecialNoBrackets: false,
        includeSpecialBrackets: false,
        includeUppercase: false,
        includeNumbers: false
    };

    for (const regex of regexes) {
        const match = input.match(regex);
        if (match) {
            switch (regex) {
                case regexes[0]: // length regex
                    let variants: number[] = [];
                    variants.push(...match.map(entry => parseInt(entry.replace(/[^\d]/g, ""), 10)));
                    let filtered = Math.min(...variants.filter(variant => variant > 3 && variant < 20));
                    conditions.length = (filtered !== Infinity ? filtered : conditions.length);
                    break;
                case regexes[1]: // special characters regex
                    conditions.includeSpecialNoBrackets = true;
                    if (/\(.+?\)/.test(match[1])) {
                        conditions.includeSpecialBrackets = true;
                    }
                    break;
                case regexes[2]: // uppercase letters regex
                    conditions.includeUppercase = true;
                    break;
                case regexes[3]: // numbers regex
                    conditions.includeNumbers = true;
                    break;
                case regexes[4]: // all other conditions regex
                    const conditionsMatch = match[0].toLowerCase();

                    if (conditionsMatch.includes("number") || conditionsMatch.includes("numeral") || conditionsMatch.includes("digit")) {
                        conditions.includeNumbers = true;
                    }
                    if (conditionsMatch.includes("symbol") || conditionsMatch.includes("special character")) {
                        conditions.includeSpecialNoBrackets = true;
                        if (/\(.+?\)/.test(conditionsMatch)) {
                            conditions.includeSpecialBrackets = true;
                        }
                    }
                    break;
            }
        }
    }

    //check any number
    let strNumbers: number[] = [];

    const keys: string[] = Object.keys(numbersMap);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (input.includes(key)) {
            strNumbers.push(numbersMap[key]);
        }
    }

    if (strNumbers.length > 0) {
        let filtered = Math.min(...strNumbers.filter(variant => variant > 3 && variant < 20));
        conditions.length = (filtered !== Infinity ? filtered : conditions.length);
    }

    // check for statements like weak and strong
    if (input.match(/weak|strong/i)) {
        // check over params to not overwrite em, if ok - set a strong one
        if (conditions.length === 8 && !conditions.includeSpecialNoBrackets && !conditions.includeSpecialBrackets && !conditions.includeUppercase && !conditions.includeNumbers) {
            conditions.length = 12;
            conditions.includeSpecialNoBrackets = true;
            conditions.includeUppercase = true;
            conditions.includeNumbers = true;
        }
    }

    return conditions;
}

class Password {
    private password: string = "";
    private settings: Settings = {
        length: 8,
        includeSpecialNoBrackets: true,
        includeSpecialBrackets: false,
        includeUppercase: true,
        includeNumbers: true
    };

    constructor(init: string);
    constructor(init: Settings);
    constructor(init: Settings | string) {
        if(typeof init == "string") {
            this.password = init;
        }
        else {
            this.settings = init;
        }
    }
}
