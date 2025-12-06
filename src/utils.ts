import type { ColorArray } from "./constants";
import { BADGE_FADE_DELAY } from "./constants";
import type { Settings } from "./types";

/**
 * Generates a cryptographically secure random integer between 0 (inclusive) and max (exclusive)
 * @param max - The upper bound (exclusive)
 * @returns A secure random integer
 */
function getSecureRandomInt(max: number): number {
	const randomBuffer = new Uint32Array(1);
	crypto.getRandomValues(randomBuffer);
	return randomBuffer[0] % max;
}

/**
 * Shuffles an array using Fisher-Yates algorithm with cryptographically secure random numbers
 * @param array - The array to shuffle
 * @returns The shuffled array
 */
function secureshuffle<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = getSecureRandomInt(i + 1);
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Generates password string based on settings
 * @param settings - Password generation settings
 * @returns {string}
 */
export function generatePassword(settings: Settings): string {
	let {
		length,
		includeSpecialNoBrackets,
		includeSpecialBrackets,
		includeUppercase,
		includeNumbers,
	} = settings;

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

	// Build the character pool based on requirements
	let possibleCharacters: string = lowercase;
	if (includeSpecialNoBrackets) possibleCharacters += specialCharactersNoBrackets;
	if (includeSpecialBrackets) possibleCharacters += specialCharactersBrackets;
	if (includeUppercase) possibleCharacters += uppercase;
	if (includeNumbers) possibleCharacters += numbers;

	// Build array with at least one of each required character type
	const requiredChars: string[] = [];

	if (includeUppercase) {
		requiredChars.push(uppercase.charAt(getSecureRandomInt(uppercase.length)));
	}
	if (includeNumbers) {
		requiredChars.push(numbers.charAt(getSecureRandomInt(numbers.length)));
	}
	if (includeSpecialNoBrackets) {
		requiredChars.push(
			specialCharactersNoBrackets.charAt(
				getSecureRandomInt(specialCharactersNoBrackets.length),
			),
		);
	}
	if (includeSpecialBrackets) {
		requiredChars.push(
			specialCharactersBrackets.charAt(getSecureRandomInt(specialCharactersBrackets.length)),
		);
	}

	// If required chars meet or exceed the requested length, shuffle and trim to exact length
	if (requiredChars.length >= length) {
		return secureshuffle(requiredChars).slice(0, length).join("");
	}

	// Fill remaining slots with random characters from the full character pool
	const remainingLength = length - requiredChars.length;
	const randomChars: string[] = [];
	for (let i = 0; i < remainingLength; i++) {
		randomChars.push(possibleCharacters.charAt(getSecureRandomInt(possibleCharacters.length)));
	}

	// Combine required and random characters, shuffle, and return
	const allChars = [...requiredChars, ...randomChars];
	return secureshuffle(allChars).join("");
}

/**
 * Checks password string strength
 * @param password
 * @returns {string}
 */
export function checkPasswordStrength(password: string): string {
	let strength: number = 0;

	if (password.length < 8) {
		return "Too short";
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

	if (/[!@#$%^&*_+\-=;':",.?/\\`{}()<>[\]]/.test(password)) {
		strength += 1;
	}

	if (password.length >= 16) {
		strength += 1;
	}

	// Check for repeating characters
	let repeatCount = 0;
	for (let i = 0; i < password.length; i++) {
		const char = password.charAt(i);
		repeatCount = password.indexOf(char, i + 1) !== -1 ? repeatCount + 1 : repeatCount;
		if (repeatCount >= 2) {
			strength -= 1;
			break;
		}
	}

	// Check for sequential characters (e.g. "abc" or "1234")
	for (let i = 0; i < password.length - 2; i++) {
		const c1 = password.charCodeAt(i);
		const c2 = password.charCodeAt(i + 1);
		const c3 = password.charCodeAt(i + 2);
		if (c1 + 1 === c2 && c2 + 1 === c3) {
			strength -= 2;
			break;
		}
	}

	switch (strength) {
		default:
			return "Weak";
		case 2:
			return "Moderate";
		case 3:
		case 4:
			return "Strong";
		case 5:
			return "Very Strong";
	}
}

export function sleep(seconds: number) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns The debounced function
 */
// biome-ignore lint/suspicious/noExplicitAny: Generic debounce function requires any for flexibility
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// biome-ignore lint/suspicious/noExplicitAny: Need to preserve function context
	return function (this: any, ...args: Parameters<T>) {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, wait);
	};
}

export async function showBadge(
	text: string,
	tabId: number,
	color: ColorArray,
	fadeDelay: number = BADGE_FADE_DELAY,
) {
	await chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: color });
	await chrome.action.setBadgeText({ tabId: tabId, text: text });
	await sleep(fadeDelay);
	await chrome.action.setBadgeText({ tabId: tabId, text: "" });
}

export function recognizePasswordConditions(input: string): Settings {
	const regexes = [
		/\d+/g, // length regex
		/(?:symbol|special (character)?)s?/i, // special characters regex
		/(?:uppercase|upper case|capital|upper)/i, // uppercase letters regex
		/(?:number|numeral|digit)s?/i, // numbers regex
		/(?:include|contains?)\s+([^,]+?(?:(?=(?:,|$))|\(.+?\)))/gi, // all other conditions regex
	];

	const numbersMap: { [K: string]: number } = {
		one: 1,
		two: 2,
		three: 3,
		four: 4,
		five: 5,
		six: 6,
		seven: 7,
		eight: 8,
		nine: 9,
		ten: 10,
		eleven: 11,
		twelve: 12,
		thirteen: 13,
		fourteen: 14,
		fifteen: 15,
		sixteen: 16,
		seventeen: 17,
		eighteen: 18,
		nineteen: 19,
		twenty: 20,
		"twenty one": 21,
		"twenty two": 22,
		"twenty three": 23,
		"twenty four": 24,
		"twenty five": 25,
		"twenty six": 26,
		"twenty seven": 27,
		"twenty eight": 28,
		"twenty nine": 29,
		thirty: 30,
	};

	const conditions: Settings = {
		length: 8,
		includeSpecialNoBrackets: false,
		includeSpecialBrackets: false,
		includeUppercase: false,
		includeNumbers: false,
	};

	for (const regex of regexes) {
		const match = input.match(regex);
		if (match) {
			switch (regex) {
				case regexes[0]: {
					// length regex
					const variants: number[] = [];
					variants.push(
						...match.map((entry) => parseInt(entry.replace(/[^\d]/g, ""), 10)),
					);
					const filtered = Math.min(
						...variants.filter((variant) => variant > 3 && variant < 20),
					);
					conditions.length = filtered !== Infinity ? filtered : conditions.length;
					break;
				}
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
				case regexes[4]: {
					// all other conditions regex
					const conditionsMatch = match[0].toLowerCase();

					if (
						conditionsMatch.includes("number") ||
						conditionsMatch.includes("numeral") ||
						conditionsMatch.includes("digit")
					) {
						conditions.includeNumbers = true;
					}
					if (
						conditionsMatch.includes("symbol") ||
						conditionsMatch.includes("special character")
					) {
						conditions.includeSpecialNoBrackets = true;
						if (/\(.+?\)/.test(conditionsMatch)) {
							conditions.includeSpecialBrackets = true;
						}
					}
					break;
				}
			}
		}
	}

	//check any number
	const strNumbers: number[] = [];

	const keys: string[] = Object.keys(numbersMap);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const wordBoundaryRegex = new RegExp(`\\b${key}\\b`, "i");
		if (wordBoundaryRegex.test(input)) {
			strNumbers.push(numbersMap[key]);
		}
	}

	if (strNumbers.length > 0) {
		const filtered = Math.min(...strNumbers.filter((variant) => variant > 3 && variant < 20));
		conditions.length = filtered !== Infinity ? filtered : conditions.length;
	}

	// check for statements like weak and strong
	if (input.match(/weak|strong/i)) {
		// check over params to not overwrite em, if ok - set a strong one
		if (
			conditions.length === 8 &&
			!conditions.includeSpecialNoBrackets &&
			!conditions.includeSpecialBrackets &&
			!conditions.includeUppercase &&
			!conditions.includeNumbers
		) {
			conditions.length = 12;
			conditions.includeSpecialNoBrackets = true;
			conditions.includeUppercase = true;
			conditions.includeNumbers = true;
		}
	}

	return conditions;
}
