import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { ParserService } from './parser.service';
import { ParserModule } from './parser.module';

interface PassportExample {
  country: string;
  passportNumber: string;
}

const TEST_STRING = `
  Hello ChatGPT!

My name is Alex Thompson, and I am the organizer of our trip. We are planning an unforgettable vacation, and we have several travelers from around the world.

  Here are the contact details for communication and booking:

  1. Alex Thompson (USA)
- Name: Alex Thompson
- Phone Number: +1 (555) 123-4567
- Email: alex.thompson@gmail.com
- IP Address: 203.0.113.1
- IBAN: US12 3456 7890 1234 5678 90
- Passport: A123456789

2. Raj Patel (India)
- Name: Raj Patel
- Phone Number: +91 98765 43210
- Email: raj.patel@example.in
- IP Address: 192.168.1.1
- IBAN: DE89 3704 0044 0532 0130 00
- Passport: INX9876543

3. Li Wei (China)
- Name: Li Wei
- Phone Number: +86 138 1234 5678
- Email: li.wei@example.cn
- IP Address: 121.0.0.1
- IBAN: GB29 NWBK 6016 1331 9268 19
- Passport: G12345678

4. Olena Kovalenko (Ukraine)
- Name: Olena Kovalenko
- Phone Number: +380 97 876 5432
- Email: olena.kovalenko@example.ua
- IP Address: 192.168.0.1
- IBAN: FR76 3000 6000 0111 0069 0138 50
- Passport: АВ123456

5. Ivan Ivanov (Russia)
- Name: Ivan Ivanov
- Phone Number: +7 987 654-32-10
- Email: ivan.ivanov@example.ru
- IP Address: 172.16.0.1
- IBAN: CA14 5991 3199 4301 9060 00
- Passport: 1234 567890

6. Marsel Jan (France)
- Name: Marsel Jan
- Phone Number: +7 985 624-32-10
- Email: Marsel.Jan@example.ru
- IP Address: 122.16.0.1
- IBAN: CA14 5961 3799 6301 4060 20
- Passport: FRAB12345678

We are looking for a hotel to stay in. Can you recommend something inspiring?

  Thanks in advance!`;

// const passportExamples: PassportExample[] = [
//   {
//     country: 'American',
//     passportNumber: faker.random.alphaNumeric(9).toUpperCase(),
//   },
//   {
//     country: 'Europe',
//     passportNumber: faker.random.alphaNumeric(10).toUpperCase(),
//   },
//   {
//     country: 'Ukraine',
//     passportNumber: `AA${faker.random
//       .alphaNumeric(9999999)
//       .toString()
//       .padStart(7, '0')}`,
//   },
//   {
//     country: 'Russian',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(999999)
//       .toString()
//       .padStart(6, '0')}`,
//   },
//   {
//     country: 'Indian',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(999999)
//       .toString()
//       .padStart(6, '0')}`,
//   },
//   {
//     country: 'Japanese',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(9999999)
//       .toString()
//       .padStart(7, '0')}${faker.random.alpha({ count: 1 }).toUpperCase()}`,
//   },
//   {
//     country: 'Chinese',
//     passportNumber: `E${faker.random
//       .alphaNumeric(99999999)
//       .toString()
//       .padStart(8, '0')}`,
//   },
//   {
//     country: 'Arabic',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(999999999)
//       .toString()
//       .padStart(9, '0')}${faker.random.alpha({ count: 2 }).toUpperCase()}`,
//   },
//   {
//     country: 'Canadian',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(999999)
//       .toString()
//       .padStart(6, '0')}`,
//   },
//   {
//     country: 'Brazilian',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(999999)
//       .toString()
//       .padStart(6, '0')}${faker.random.alpha({ count: 1 }).toUpperCase()}`,
//   },
//   {
//     country: 'Argentine',
//     passportNumber: `${faker.random
//       .alpha({ count: 2 })
//       .toUpperCase()}${faker.random
//       .alphaNumeric(9999999)
//       .toString()
//       .padStart(7, '0')}`,
//   },
//   {
//     country: 'Egyptian',
//     passportNumber: `A${faker.random
//       .alphaNumeric(9999999)
//       .toString()
//       .padStart(7, '0')}`,
//   },
//   {
//     country: 'Turkish',
//     passportNumber: `A${faker.random
//       .alphaNumeric(999999)
//       .toString()
//       .padStart(6, '0')}${faker.random.alpha({ count: 1 }).toUpperCase()}`,
//   },
// ];

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParserService, ParserModule],
    }).compile();

    service = module.get<ParserService>(ParserService);
  });

  describe('parse', () => {
    it('should parse the input string and return the processed string', () => {
      const processedString = service.parse(TEST_STRING);
      expect(processedString).toEqual(TEST_STRING);
      // Add more assertions based on the expected behavior of the parse method
    });
  });

  describe('parseData', () => {
    it('should encrypt/obfuscate the parsed sensitive data', () => {
      const sensitiveData = service.parseData(TEST_STRING);
      expect(sensitiveData).toBeDefined();
      expect(sensitiveData.emailAddresses.includes('alex.thompson@gmail.com'));
      console.log(sensitiveData.passportNumbers);
      expect(sensitiveData.passportNumbers.length).toEqual(5);
    });
  });

  describe('cryptData', () => {
    it('should encrypt/obfuscate the parsed sensitive data', () => {
      const sensitiveData = service.parseData(TEST_STRING);
      const encryptedData = service.cryptData(sensitiveData);
      // console.log(encryptedData);
      expect(encryptedData).toBeDefined();
      // expect(encryptedData[0]).toHaveProperty(origin);
    });
  });

  // describe('hideSensitiveData', () => {
  //   it('should replace the sensitive data in the string with obfuscated values', () => {
  //     const inputString = 'This is sensitive data';
  //     const obfuscatedString = service.hideSensitiveData(inputString);
  //     expect(obfuscatedString).toBeDefined();
  //     // Add more assertions based on the expected behavior of the hideSensitiveData method
  //   });
  // });
  //
  // describe('restoreResponse', () => {
  //   it('should restore the original sensitive data by replacing the obfuscated values', () => {
  //     const obfuscatedString = 'This is obfuscated data';
  //     const restoredString = service.restoreResponse(obfuscatedString);
  //     expect(restoredString).toBeDefined();
  //     // Add more assertions based on the expected behavior of the restoreResponse method
  //   });
  // });

  describe('cryptEmails', () => {
    it('should encrypt/obfuscate the email addresses in the input string', () => {
      const inputString = ['Email: test@example.com'];
      const processedString = service.cryptEmails(inputString);
      expect(processedString).toBeDefined();
    });
  });

  // Add more test cases for other methods in the ParserService class
});
