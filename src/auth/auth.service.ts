import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateRequest(request, role: string): boolean {
    return request.user.scope === role;
  }
}
