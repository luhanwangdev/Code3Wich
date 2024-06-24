import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';

import dotenv from 'dotenv';
import AppError from '../utils/appError.js';

dotenv.config();

interface UserJwtPayload extends JwtPayload {
  id: number;
  name: string;
  email: string;
}

const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  if (!token) {
    throw new AppError('No token!', 401);
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET_KEY as string,
    (err: VerifyErrors, decoded: JwtPayload) => {
      if (err) {
        throw new AppError('Wrong token!', 403);
      }

      req.user = decoded as UserJwtPayload;

      return next();
    }
  );
};

export default jwtAuthMiddleware;
