import { SetMetadata } from '@nestjs/common';

export const Role = (role) => SetMetadata('role', role);
