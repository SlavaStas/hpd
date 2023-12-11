import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as compromise from 'compromise';

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
  driverLicenses?: string[];
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

    // Driver Licenses
    const driverLicenses: string[] = this.parseDriverLicenses(inputString);
    if (driverLicenses) {
      parsedData.driverLicenses = driverLicenses;
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
    if (originalString.includes(targetWord)) {
      const regex = new RegExp(targetWord, 'gi');
      return originalString.replace(regex, replacement);
    }

    return originalString;
  }

  public cryptData(data: ParsedData): Changes[] {
    const cryptData: Changes[] = [];

    cryptData.push(...this.maskData(data.emailAddresses));
    cryptData.push(...this.maskData(data.ipAddresses));
    cryptData.push(...this.maskData(data.iban));
    cryptData.push(...this.maskData(data.creditCardNumbers));
    cryptData.push(...this.cryptNames(data.names));
    cryptData.push(...this.maskData(data.passportNumbers));
    cryptData.push(...this.cryptPhoneNumbers(data.phoneNumbers));
    cryptData.push(...this.maskData(data.driverLicenses));

    return cryptData;
  }

  public maskData(source: string[]): Changes[] {
    return source.map((origin: string): Changes => {
      return {
        origin: origin,
        fake: this.generateRandomFormattedString(origin),
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

  public generateRandomFormattedString(source: string): string {
    let randomString = '';
    for (let i = 0; i <= source.length - 1; i++) {
      if (this.charset.letters.includes(source[i])) {
        randomString += this.generateRandomString(1, 'letters');
      } else if (this.charset.numbers.includes(source[i])) {
        randomString += this.generateRandomString(1, 'numbers');
      } else {
        randomString += source[i];
      }
    }

    return randomString;
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
    const ipRegexes = [
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/g,
      /([A-F0-9]{1,4}:){2,7}[A-F0-9]{1,4}/g,
      /((([A-F0-9]{1,4}:){2,6})((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))/g,
    ];

    const ipAddresses = [];
    ipRegexes.forEach((regex) => {
      const matches = input.match(regex);
      if (matches) {
        ipAddresses.push(...matches);
      }
    });

    return [...new Set(ipAddresses)];
  }

  public parseEmailAddresses(input: string): string[] {
    const emailAddressesRegexp =
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    return input.match(emailAddressesRegexp) || [];
  }

  public parsePhoneNumber(input: string): string[] {
    const phoneNumbersRegexes = [
      /((1|001)[-. ]?)?(\([0-9]{3}\)[-. ]?|[0-9]{3}[-. ])[0-9]{3}[-. ][0-9]{4}/g,
      /(?:[0-9][ .()\/-]?){6,14}[0-9]/g,
      /[0-9]{5,17}/g,
    ];
    const phoneNumbers: string[] = [];
    phoneNumbersRegexes.forEach((regex) => {
      const matches = input.match(regex);
      if (matches) {
        phoneNumbers.push(...matches);
      }
    });

    return [...new Set(phoneNumbers)];
  }

  public parseDriverLicenses(input: string): string[] {
    const driverLicensesRegexes = [
      /[A-Z][0-9]{4,9}/g,
      /[A-Z][0-9]{10,14}/g,
      /[A-Z][0-9]{8,9}/g,
      /[-]/g,
      /[A-Z][0-9]{10,13}/g,
      /[-]/g,
      /[A-Z]{2}[0-9]{3,7}/g,
      /[0-9]{7}[A-Z]|[0-9]{8}[A-Z]{2}|[0-9]{9}[A-Z]/g,
      /[0-9]{2,3} [0-9]{3} [0-9]{3}/g,
      /[0-9]{3}[A-Z]{2}[0-9]{4}|[0-9]{2}[A-Z]{3}[0-9]{5}/g,
      /([0-9]{6,14})/g,
      /[0-9]{2}-[0-9]{3}-[0-9]{4}/g,
      /[A-Z]{2}[0-9]{6}[A-Z]/g,
      /[0-9]{2}-[0-9]{4}-[0-9]{4}/g,
      /SA[0-9]{7}/g,
      /[A-Z]( [0-9]{3}){4}/g,
      /([0-9]{3}-[0-9]{2}-[0-9]{4})/g,
      /[0-9]{3}[A-Z][0-9]{6}|[A-Z][0-9]{6}R/g,
      /NHL[0-9]{8}/g,
      /[A-Z]{3} ?[0-9]{2} ?[0-9]{4}/g,
      /[A-Z][0-9]{4} [0-9]{5} [0-9]{5}/g,
      /[-]/g,
      /[A-Z]([A-Z]{4}|[A-Z]{3}\*|[A-Z]{2}\*{2}|\*[A-Z]{3})[A-Z]{2}[0-9A-Z]{5}/g,
      /WDL[0-9A-Z]{9}/g,
      /[0-9]{6}-[0-9]{3/g,
    ];

    const driverLicenses: string[] = [];
    driverLicensesRegexes.forEach((regex) => {
      const matches = input.match(regex);
      if (matches) {
        driverLicenses.push(...matches);
      }
    });

    return [...new Set(driverLicenses)];
  }

  public parseCreditCard(input: string): string[] {
    const creditCardRegexes = [
      /\b(?:\d[ -]*?){13,16}\b/g,
      /(?:3[47][0-9]{2}[0-9]{6}[0-9]{4})/g,
      /(?:4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?)/g,
      /(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}/g,
      /(?:2131|1800|35[0-9]{3})[0-9]{11}/g,
      /3(?:0[0-5,9]|6[0-9])[0-9]{11}|3[89][0-9]{12}?(?:[0-9]{1,3})?/g,
      /6(?:(011|5[0-9][0-9])[0-9]{2}|4[4-9][0-9]{3}|2212[6-9]|221[3-9][0-9]|22[2-8][0-9]{2}|229[0-1][0-9]|2292[0-5])[0-9]{10}?(?:[0-9]{3})?/g,
    ];
    const creditCards: string[] = [];
    creditCardRegexes.forEach((regex) => {
      const matches = input.match(regex);
      if (matches) {
        creditCards.push(...matches);
      }
    });

    return [...new Set(creditCards)];
  }

  public parseIBAN(input: string): string[] {
    const ibanRegex =
      /(AD[0-9]{10}[A-Z0-9]{12})|(AE[0-9]{21})|(AL[0-9]{10}[A-Z0-9]{16})|(AT[0-9]{18})|(AZ[0-9]{2}[A-Z]{4}[A-Z0-9]{20})|(BA[0-9]{18})|(BE[0-9]{14})|(BG[0-9]{2}[A-Z]{4}[0-9]{6}[A-Z0-9]{8})|(BH[0-9]{2}[A-Z]{4}[A-Z0-9]{14})|(BI[0-9]{25})|(BR[0-9]{25}[A-Z]{1}[A-Z0-9]{1})|(BY[0-9]{2}[A-Z0-9]{4}[0-9]{4}[A-Z0-9]{16})|(CH[0-9]{7}[A-Z0-9]{12})|(CR[0-9]{20})|(CY[0-9]{10}[A-Z0-9]{16})|(CZ[0-9]{22})|(DE[0-9]{20})|(DJ[0-9]{25})|(DK[0-9]{16})|(DO[0-9]{2}[A-Z0-9]{4}[0-9]{20})|(EE[0-9]{18})|(EG[0-9]{27})|(ES[0-9]{22})|(FI[0-9]{16})|(FO[0-9]{16})|(FR[0-9]{12}[A-Z0-9]{11}[0-9]{2})|(GB[0-9]{2}[A-Z]{4}[0-9]{14})|(GE[0-9]{2}[A-Z]{2}[0-9]{16})|(GI[0-9]{2}[A-Z]{4}[A-Z0-9]{15})|(GL[0-9]{16})|(GR[0-9]{9}[A-Z0-9]{16})|(GT[0-9]{2}[A-Z0-9]{24})|(HR[0-9]{19})|(HU[0-9]{26})|(IE[0-9]{2}[A-Z]{4}[0-9]{14})|(IL[0-9]{21})|(IQ[0-9]{2}[A-Z]{4}[0-9]{15})|(IS[0-9]{24})|(IT[0-9]{2}[A-Z]{1}[0-9]{10}[A-Z0-9]{12})|(JO[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z0-9]{18})|(KW[0-9]{2}[A-Z]{4}[A-Z0-9]{22})|(KZ[0-9]{5}[A-Z0-9]{13})|(LB[0-9]{6}[A-Z0-9]{20})|(LC[0-9]{2}[A-Z]{4}[A-Z0-9]{24})|(LI[0-9]{7}[A-Z0-9]{12})|(LT[0-9]{18})|(LU[0-9]{5}[A-Z0-9]{13})|(LV[0-9]{2}[A-Z]{4}[A-Z0-9]{13})|(LY[0-9]{23})|(MC[0-9]{12}[A-Z0-9]{11}[0-9]{2})|(MD[0-9]{2}[A-Z0-9]{20})|(ME[0-9]{20})|(MK[0-9]{5}[A-Z0-9]{10}[0-9]{2})|(MR[0-9]{25})|(MT[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z0-9]{18})|(MU[0-9]{2}[A-Z]{4}[0-9]{19}[A-Z]{3})|(NL[0-9]{2}[A-Z]{4}[0-9]{10})|(NO[0-9]{13})|(PK[0-9]{2}[A-Z]{4}[A-Z0-9]{16})|(PL[0-9]{26})|(PS[0-9]{2}[A-Z]{4}[A-Z0-9]{21})|(PT[0-9]{23})|(QA[0-9]{2}[A-Z]{4}[A-Z0-9]{21})|(RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16})|(RS[0-9]{20})|(RU[0-9]{31})|(SA[0-9]{4}[A-Z0-9]{18})|(SC[0-9]{2}[A-Z]{4}[0-9]{20}[A-Z]{3})|(SD[0-9]{16})|(SE[0-9]{22})|(SI[0-9]{17})|(SK[0-9]{22})|(SM[0-9]{2}[A-Z]{1}[0-9]{10}[A-Z0-9]{12})|(SO[0-9]{21})|(ST[0-9]{23})|(SV[0-9]{2}[A-Z]{4}[0-9]{20})|(TL[0-9]{21})|(TN[0-9]{22})|(TR[0-9]{8}[A-Z0-9]{16})|(UA[0-9]{8}[A-Z0-9]{19})|(VA[0-9]{20})|(VG[0-9]{2}[A-Z]{4}[0-9]{16})|(XK[0-9]{18})/g;

    return input.match(ibanRegex) || [];
  }
}
