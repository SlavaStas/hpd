import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as compromise from 'compromise';

type Changes = {
  origin: string;
  fake: string;
};

type ParsedData = {
  sixDigits?: string[];
  emailAddresses?: string[];
  ipAddresses?: string[];
  names?: string[];
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
     * Place for request to AI
     * const response =
     */

    const restoredResponse: string = this.restoreResponse(
      changedString, // TODO: Replace with a response
      changes,
    );
    this.logger.log('restoredResponse');
    this.logger.debug(restoredResponse);

    return restoredResponse;
  }

  public findSixDigitSequence(text: string): string[] {
    const regex = /(\d\s*-?\s*){6}/g;

    const txt: string = text.replace(/[()]/g, ' ');
    const matches = txt.match(regex);
    return matches || [];
  }

  public parseData(inputString: string): ParsedData {
    const parsedData: ParsedData = {};

    // Six Digits
    const sixDigits: string[] = this.findSixDigitSequence(inputString);
    if (sixDigits) {
      parsedData.sixDigits = sixDigits;
    }

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

    // Parse Names
    const parsedNames: string[] = this.parseNames(inputString);
    if (parsedNames) {
      parsedData.names = parsedNames;
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
    const regex = new RegExp(targetWord, 'gi');
    return originalString.replace(regex, replacement);
  }

  public cryptData(data: ParsedData): Changes[] {
    const cryptData: Changes[] = [];

    if (data.sixDigits) {
      cryptData.push(...this.cryptCodes(data.sixDigits));
    }

    if (data.emailAddresses) {
      cryptData.push(...this.cryptEmails(data.emailAddresses));
    }

    if (data.ipAddresses) {
      cryptData.push(...this.cryptIpAddresses(data.ipAddresses));
    }

    if (data.names) {
      cryptData.push(...this.cryptNames(data.names));
    }

    return cryptData;
  }

  public cryptCodes(codes: string[]): Changes[] {
    return codes.map((code: string): Changes => {
      return {
        origin: code,
        fake: this.generateRandomString(6, 'numbers'),
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

  public parseIpAddress(input: string): string[] {
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

    return input.match(ipRegex) || [];
  }

  public parseEmailAddresses(input: string): string[] {
    const emailAddressesRegexp =
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    return input.match(emailAddressesRegexp) || [];
  }
}
