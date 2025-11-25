import { Request, Response, NextFunction } from 'express';
import { HttpError } from './http-error';

export default function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message:
      statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
}
