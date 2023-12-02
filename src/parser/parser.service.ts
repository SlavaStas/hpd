import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as compromise from 'compromise';
import * as ibanTools from 'ibantools';

type Changes = {
  origin: string;
  fake: string;
};

type ParsedData = {
  emailAddresses?: string[];
  phoneNumbers?: string[];
  passportNumbers?: string[];
  ipAddresses?: string[];
  iban?: string[];
  names?: string[];
  creditCardNumbers?: string[];
};

@Injectable()
export class ParserService {
  public readonly logger: Logger = new Logger(ParserService.name);
  public readonly charset: { numbers: string; letters: string; mixed: string } =
    {
      numbers: '0123456789',
      letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      mixed: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    };

  public parse(inputString: string): string {
    const changes: Changes[] = [];
    const parsedData: ParsedData = this.parseData(inputString);

    this.logger.log('parsedData');
    this.logger.debug(parsedData);

    changes.push(...this.cryptData(parsedData));

    this.logger.log('changes');
    this.logger.debug(changes);

    const changedString: string = this.hideSensitiveData(inputString, changes);

    this.logger.log('changedString');
    this.logger.debug(changedString);

    /**
     * Place for request to third service
     * response =
     */

    const restoredResponse: string = this.restoreResponse(inputString, changes);
    this.logger.log('restoredResponse');
    this.logger.debug(restoredResponse);

    return restoredResponse;
  }

  public parseData(inputString: string): ParsedData {
    const parsedData: ParsedData = {};

    // Email addresses
    const parsedEmail: string[] = this.parseEmailAddresses(inputString);
    if (parsedEmail) {
      parsedData.emailAddresses = parsedEmail;
    }

    // IP addresses
    const parsedIp: string[] = this.parseIpAddress(inputString);
    if (parsedIp) {
      parsedData.ipAddresses = parsedIp;
    }

    // Credit cards
    const parsedCreditCard: string[] = this.parseCreditCard(inputString);
    if (parsedCreditCard) {
      parsedData.creditCardNumbers = parsedCreditCard;
    }

    // IBAN
    const parsedIBAN: string[] = this.parseIBAN(inputString);
    if (parsedIBAN) {
      parsedData.iban = parsedIBAN;
    }

    // Parse Names
    const parsedNames: string[] = this.parseNames(inputString);
    if (parsedNames) {
      parsedData.names = parsedNames;
    }

    // Parse Passport Numbers
    const parsedPassportNumbers: string[] =
      this.parsePassportNumbers(inputString);
    if (parsedPassportNumbers) {
      parsedData.passportNumbers = parsedPassportNumbers;
    }

    // Phone numbers
    const numbers: string[] = this.parsePhoneNumber(inputString);
    if (numbers) {
      parsedData.phoneNumbers = numbers;
    }

    return parsedData;
  }

  public generateRandomName(isFullName: boolean): string {
    const firstName: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();
    if (isFullName) {
      return `${firstName} ${lastName}`;
    } else {
      return lastName;
    }
  }

  public restoreResponse(string: string, changes: Changes[]): string {
    let newString = '';
    newString += string;

    changes.forEach((word: Changes) => {
      if (newString.includes(word.fake)) {
        newString = this.replaceWord(newString, word.fake, word.origin);
      }
    });

    return newString;
  }

  public hideSensitiveData(source: string, changes: Changes[]): string {
    let newString = '';
    newString += source;

    changes.forEach((word: Changes) => {
      if (newString.includes(word.origin)) {
        newString = this.replaceWord(newString, word.origin, word.fake);
      }
    });

    return newString;
  }

  public replaceWord(
    originalString: string,
    targetWord: string,
    replacement: string,
  ): string {
    this.logger.debug(originalString);
    this.logger.log('targetWord');
    this.logger.log(targetWord);
    this.logger.log('replacement');
    this.logger.log(replacement);
    const regex = new RegExp(targetWord, 'gi');
    return originalString.replace(regex, replacement);
  }

  public cryptData(data: ParsedData): Changes[] {
    const cryptData: Changes[] = [];

    cryptData.push(...this.cryptEmails(data.emailAddresses));
    cryptData.push(...this.cryptIpAddresses(data.ipAddresses));
    cryptData.push(...this.cryptIban(data.iban));
    cryptData.push(...this.cryptCardNumbers(data.creditCardNumbers));
    cryptData.push(...this.cryptNames(data.names));
    cryptData.push(...this.cryptPassportNumbers(data.passportNumbers));
    cryptData.push(...this.cryptPhoneNumbers(data.phoneNumbers));

    return cryptData;
  }

  public cryptPassportNumbers(passportNumbers: string[]): Changes[] {
    return passportNumbers.map((number: string): Changes => {
      return {
        origin: number,
        fake: faker.string.alphanumeric(9).toUpperCase(),
      };
    });
  }

  public cryptNames(names: string[]): Changes[] {
    return names.map((name: string): Changes => {
      return {
        origin: name,
        fake: this.generateRandomName(name.includes(' ')),
      };
    });
  }

  public cryptEmails(emails: string[]): Changes[] {
    return emails.map((email: string): Changes => {
      const emailParts: string[] = email.split('@');
      const fakeEmail = `${this.generateRandomString(
        emailParts[0].length,
        'letters',
      )}@${emailParts[1]}`;

      return {
        origin: email,
        fake: fakeEmail,
      };
    });
  }

  public cryptIpAddresses(ipAddresses: string[]): Changes[] {
    return ipAddresses.map((ipAddress: string): Changes => {
      const ipParts: string[] = ipAddress.split('.');
      const fakeIp = `${this.generateRandomString(
        ipParts[0].length,
        'numbers',
      )}.${this.generateRandomString(
        ipParts[1].length,
        'numbers',
      )}.${this.generateRandomString(
        ipParts[2].length,
        'numbers',
      )}.${this.generateRandomString(ipParts[3].length, 'numbers')}`;

      return {
        origin: ipAddress,
        fake: fakeIp,
      };
    });
  }

  public cryptIban(ibans: string[]): Changes[] {
    return ibans.map((iban: string): Changes => {
      return {
        origin: iban,
        fake: this.generateRandomString(iban.length, 'mixed'),
      };
    });
  }

  public cryptCardNumbers(cardNumbers: string[]): Changes[] {
    return cardNumbers.map((number: string): Changes => {
      if (number.includes('-')) {
        return {
          origin: number,
          fake: `${this.generateRandomString(
            4,
            'numbers',
          )}-${this.generateRandomString(
            4,
            'numbers',
          )}-${this.generateRandomString(
            4,
            'numbers',
          )}-${this.generateRandomString(4, 'numbers')}`,
        };
      } else {
        return {
          origin: number,
          fake: this.generateRandomString(number.length, 'numbers'),
        };
      }
    });
  }

  public cryptPhoneNumbers(phoneNumbers: string[]): Changes[] {
    return phoneNumbers.map((number: string): Changes => {
      return {
        origin: number,
        fake: this.generateRandomPhoneNumber(),
      };
    });
  }

  public generateRandomPhoneNumber(): string {
    const countryCode = Math.floor(Math.random() * (999 - 1) + 1)
      .toString()
      .padStart(3, '0');
    const operatorCode = Math.floor(Math.random() * (999 - 1) + 1)
      .toString()
      .padStart(3, '0');
    const phoneNumber = Math.floor(Math.random() * (9999999 - 1) + 1)
      .toString()
      .padStart(7, '0');

    return `${countryCode} (${operatorCode}) ${phoneNumber}`;
  }

  public generateRandomString(
    length: number,
    type: 'numbers' | 'letters' | 'mixed',
  ): string {
    const characters: string = this.charset[type];
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex: number = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  public parseNames(inputString: string): string[] {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const doc = compromise(inputString);

    return doc.people().out('array') as string[];
  }

  public parsePassportNumbers(input: string): string[] {
    const parsedPassports: string[] = [];
    const passportRegexps: RegExp[] = [
      // /\b[A-Za-z]{1,2}\s?\d{6,8}\s?[A-Za-z]{0,2}\b(?!\s)/g, // Common passport formats
      /\b[E|G]\d{8}\b/g, // Chinese passports
      /\b[A-Z]{1,3}\d{7}\b/g, // Indian passports
      /\b\d{2}\s?\d{2}\s?\d{6}\b/g, // Russian passports
      /\b(?:DE|FRAB|ITA|ESPA|NL|BE|AT|GRAB|PT|DK|SE|FI|IE|LU|MTAB)\d{8,11}[A-Za-z]?\b/g, // ES passports
      /\b[A-Z]\d{9}\b/g, // American passports,
      /\b[A-Z]{2}\s?\d{6}\b/g, // Ukraine passports
    ];

    passportRegexps.forEach((regex: RegExp) => {
      this.logger.log(regex);
      const parsed = input.match(regex);
      this.logger.log(parsed);
      if (parsed) {
        parsedPassports.push(...parsed);
      }

      return [...new Set(parsed)];
    });

    return parsedPassports;
  }

  public parseIpAddress(input: string): string[] {
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

    return input.match(ipRegex) || [];
  }

  public parseEmailAddresses(input: string): string[] {
    const emailAddressesRegexp =
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    return input.match(emailAddressesRegexp) || [];
  }

  public parsePhoneNumber(input: string): string[] {
    const phoneNumberRegex =
      /(\d{1,2}\s?)?(\(\d{1,4}\)|\d{1,4})[-\s]?(\d{1,4}[-\s]?\d{1,9})/g;
    return (
      input
        .match(phoneNumberRegex)
        .filter((number: string): boolean => number.length >= 10) || []
    );
  }

  public parseCreditCard(input: string): string[] {
    const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;

    return input.match(creditCardRegex) || [];
  }

  public parseIBAN(input: string): string[] {
    const ibanRegex =
      /\b[A-Z]{2}\d{2}(?:\s?\d{4}){3}\d{4}|\b[A-Z]{2}\d{2}\d{16}\b/g;

    return input.match(ibanRegex) || [];
  }
}
