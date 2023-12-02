import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ParserService } from './parser.service';
import { InputParseDto } from './dto';

@Controller('parser')
export class ParserController {
  private readonly logger: Logger = new Logger(ParserController.name);

  constructor(private readonly parserService: ParserService) {}

  @Post()
  public parseInputString(@Body() { string }: InputParseDto): string {
    this.logger.log(`Parsing string: ${string}`);
    return this.parserService.parse(string);
  }
}
