import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor() {}

  isValid(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  hash(password: string) {
    return bcrypt.hash(password, 10);
  }
}