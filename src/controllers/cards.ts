import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import { HttpError } from '../errors/http-error';
import { STATUS_CODES } from '../constants/status-codes';

// -------------------------
// Получить все карточки
// -------------------------
export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (err) {
    next(err);
  }
};

// -------------------------
// Создать карточку
// -------------------------
export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const { name, link } = req.body;

    const card = await Card.create({
      name,
      link,
      owner: req.user._id,
    });

    res.status(STATUS_CODES.CREATED).send(card);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Неверные данные карточки'));
    }
    next(err);
  }
};

// -------------------------
// Удалить карточку
// -------------------------
export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Карточка не найдена'));
    }

    if (card.owner.toString() !== req.user._id) {
      return next(new HttpError(STATUS_CODES.FORBIDDEN, 'Нельзя удалить чужую карточку'));
    }

    const removed = await Card.findByIdAndDelete(req.params.cardId);

    res.send(removed);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Некорректный ID карточки'));
    }
    next(err);
  }
};

// -------------------------
// Поставить лайк
// -------------------------
export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Карточка не найдена'));
    }

    res.send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Некорректный ID карточки'));
    }
    next(err);
  }
};

// -------------------------
// Удалить лайк
// -------------------------
export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Карточка не найдена'));
    }

    res.send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Некорректный ID карточки'));
    }
    next(err);
  }
};
