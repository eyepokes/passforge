import {it} from 'mocha';
import {expect} from 'chai';
import fs from 'fs';
import sinon from 'sinon';
import {generatePassword, checkPasswordStrength, recognizePasswordConditions} from '../src/utils';

describe('generatePassword()', () => {
    it('should generate a password of the specified length', () => {
        const password = generatePassword(12, true, true, true, true);
        expect(password.length).to.equal(12);
    });

    it('should generate a password that includes special characters if includeSpecialNoBrackets is set to true', () => {
        const password = generatePassword(12, true, true, true, true);
        expect(password).to.match(/[!@#$%^&*_+\-=;':",.?/`]/);
    });

    it('should generate a password that includes special bracket characters if includeSpecialBrackets is set to true', () => {
        const password = generatePassword(12, true, true, true, true);
        expect(password).to.match(/[{}()<>\[\]]/);
    });

    it('should generate a password that includes uppercase characters if includeUppercase is set to true', () => {
        const password = generatePassword(12, true, true, true, true);
        expect(password).to.match(/[A-Z]/);
    });

    it('should generate a password that includes numbers if includeNumbers is set to true', () => {
        const password = generatePassword(12, true, true, true, true);
        expect(password).to.match(/[\d]/);
    });

    it('should generate a password with length 8', () => {
        let password = generatePassword(-2, true, true, true, true);
        expect(password.length).to.equal(8);
        password = generatePassword(51, true, true, true, true);
        expect(password.length).to.equal(8);
    });
});

describe('checkPasswordStrength()', () => {
    afterEach(() => {
        sinon.restore();
    });

    before(() => {
        let stub_getMessage = sinon.stub();
        stub_getMessage.withArgs("password_strength_weak").returns("Weak");
        stub_getMessage.withArgs("password_strength_moderate").returns("Moderate");
        stub_getMessage.withArgs("password_strength_strong").returns("Strong");
        stub_getMessage.withArgs("password_strength_very_strong").returns("Very Strong");

        (global as any).chrome = {
            i18n: {
                getMessage: stub_getMessage
            }
        };
    });

    it('should return "Too short" if password length is less than 8', () => {
        let password = "3^Gm2R";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Too short');
    });

    it('should return "Weak" if password contains only lowercase letters', () => {
        let password = "aylntxdw";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Weak');
    });

    it('should return "Weak" if password contains only uppercase letters', () => {
        let password = "ABCDEFGH";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Weak');
    });

    it('should return "Weak" if password contains only numbers', () => {
        let password = "12345678";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Weak');
    });

    it('should return "Moderate" if password contains lowercase letters and numbers', () => {
        let password = "mzhfr9vk";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Moderate');
    });

    it('should return "Moderate" if password contains uppercase letters and numbers', () => {
        let password = "QBWERA32";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Moderate');
    });

    it('should return "Strong" if password contains lowercase, uppercase letters, and numbers', () => {
        let password = "A91yGFG2";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Strong');
    });

    it('should return "Very Strong" if password contains lowercase, uppercase letters, numbers, and special characters, has no repeats and no sequential characters', () => {
        let password = "aDeFj1AcEfT!$*DtK";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Very Strong');
    });

    it('should return "Weak" if password contains repeating characters', () => {
        let password = "aBcDefggh";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Weak');
    });

    it('should return "Weak" if password contains sequential characters', () => {
        let password = "aBcDef123";
        let result = checkPasswordStrength(password);
        expect(result).to.equal('Weak');
    });
});

describe('recognizePasswordConditions', function() {
    it('should recognize a password that is too short and requires a number', function () {
        const result = recognizePasswordConditions("Password needs a number and lowercase letter");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialBrackets: false,
            includeSpecialNoBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize a password that is too short and requires a lowercase letter and a number', function () {
        const result = recognizePasswordConditions("Password is too short");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialBrackets: false,
            includeSpecialNoBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });

    it('should recognize a password that requires at least 8 characters', function () {
        const result = recognizePasswordConditions("Create a password with at least 8 characters.");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });

    it('should recognize a password that must be at least 8 characters long', function () {
        const result = recognizePasswordConditions("Password must be at least 8 characters long");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });

    it('should recognize a password that is too short', function () {
        const result = recognizePasswordConditions("Your password isn’t strong enough, try making it longer.");
        expect(result).to.deep.equal({
            length: 12,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
    });

    it('should recognize a password that must have at least 6 characters', function () {
        const result = recognizePasswordConditions("Passwords must be at least 6 characters.");
        expect(result).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });

    it('should recognize a password that must have at least 8 characters and a mix of letters, numbers, and symbols', function () {
        const result = recognizePasswordConditions("Use 8 or more characters with a mix of letters, numbers & symbols");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize a password that must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols', function () {
        const result = recognizePasswordConditions("Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols.");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
    });

    it('should recognize valid password conditions for input: Use at least 8 characters', () => {
        const result = recognizePasswordConditions("Use at least 8 characters");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });

    it('should recognize valid password conditions for input: Your password is too weak. Set a stronger one.', () => {
        const result = recognizePasswordConditions("Your password is too weak. Set a stronger one.");
        expect(result).to.deep.equal({
            length: 12,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
    });

    it('should recognize valid password conditions for input: At least 1 letter, a number or symbol, at least 8 characters.', () => {
        const result = recognizePasswordConditions("At least 1 letter, a number or symbol, at least 8 characters.");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize valid password conditions for input: At least 1 letter, a number or symbol, at least 8 to 20 characters.', () => {
        const result = recognizePasswordConditions("At least 1 letter, a number or symbol, at least 8 characters.");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize valid password conditions for input: Use 8 or more characters with a mix of letters, numbers, and symbols.', () => {
        const result = recognizePasswordConditions("Use 8 or more characters with a mix of letters, numbers, and symbols.");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize valid password conditions for input: Your password must have: 8 to 20 characters Letters, numbers, and special characters', () => {
        const result = recognizePasswordConditions("Your password must have:\n\n8 to 20 characters\nLetters, numbers, and special characters");
        expect(result).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
    });

    it('should recognize it all', () => {
        let conditions = fs.readFileSync("./tests/resources/password_conditions.txt").toString().split("---");

        expect(recognizePasswordConditions(conditions[0])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[1])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[2])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[3])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[4])).to.deep.equal({
            length: 12,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[5])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[6])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[7])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[8])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[9])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[10])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[11])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[12])).to.deep.equal({
            length: 12,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[13])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[14])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[15])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[16])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[17])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[18])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });

        expect(recognizePasswordConditions(conditions[19])).to.deep.equal({
            length: 7,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[20])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[21])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[22])).to.deep.equal({
            length: 6,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[23])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[24])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
        expect(recognizePasswordConditions(conditions[25])).to.deep.equal({
            length: 12,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: true,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[26])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[27])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[28])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: true,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: true
        });
        expect(recognizePasswordConditions(conditions[29])).to.deep.equal({
            length: 8,
            includeSpecialNoBrackets: false,
            includeSpecialBrackets: false,
            includeUppercase: false,
            includeNumbers: false
        });
    });
});