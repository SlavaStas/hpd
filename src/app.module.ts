import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfiguration } from './database.configuration';
import { DatabaseConfigurationChatlyn } from './database.chatlyn.configuration';
import { ParserModule } from './parser/parser.module';
import typeOrmConfig from './migrations.autorun.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration,
      name: 'MW_CONNECTION',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigurationChatlyn,
      name: 'CHATLYN_CONNECTION',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => typeOrmConfig,
    }),
    TypeOrmModule.forFeature([], 'MW_CONNECTION'),
    ParserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
