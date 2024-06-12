export interface Settings {
    length: number,
    includeSpecialNoBrackets: boolean,
    includeSpecialBrackets: boolean,
    includeUppercase: boolean,
    includeNumbers: boolean,
    [k: string]: number | boolean;
}
