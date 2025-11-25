import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../errors/http-error';
import { STATUS_CODES } from '../constants/status-codes';

export default function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.jwt;

  if (!token) {
    return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
  }

  try {
    const payload = jwt.verify(token, 'some-secret-key') as { _id: string };

    req.user = { _id: payload._id };

    next();
  } catch (err) {
    next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Неверный токен авторизации'));
  }
}
