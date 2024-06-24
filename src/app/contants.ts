import { Request } from 'express';
import { User } from '@prisma/client';

export type Config = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: number;
  UPLOAD_LOCATION: string;
};

export type AuthorizedRequest = Request & {
  user: User;
};
