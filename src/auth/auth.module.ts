import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [JwtModule, HttpModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
