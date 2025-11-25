import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { HttpError } from '../errors/http-error';
import { STATUS_CODES } from '../constants/status-codes';

// -------------------------
// Получить всех пользователей
// -------------------------
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    next(err);
  }
};

// -------------------------
// Получить пользователя по ID
// -------------------------
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Пользователь не найден'));
    }

    res.send(user);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Некорректный формат ID пользователя'));
    }
    next(err);
  }
};

// -------------------------
// Регистрация пользователя
// -------------------------
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(STATUS_CODES.CREATED).send(safeUser);
  } catch (err: any) {
    if (err.code === 11000) {
      return next(new HttpError(STATUS_CODES.CONFLICT, 'Пользователь с таким email уже существует'));
    }

    if (err.name === 'ValidationError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Переданы некорректные данные'));
    }

    next(err);
  }
};

// -------------------------
// Логин
// -------------------------
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Неверный логин или пароль'));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Неверный логин или пароль'));
    }

    const token = jwt.sign(
      { _id: user._id },
      'some-secret-key',
      { expiresIn: '7d' },
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    res.send({ message: 'Авторизация успешна' });
  } catch (err) {
    next(err);
  }
};

// -------------------------
// Текущий пользователь
// -------------------------
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Пользователь не найден'));
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
};

// -------------------------
// Обновление профиля
// -------------------------
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Пользователь не найден'));
    }

    res.send(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Неверные данные профиля'));
    }
    next(err);
  }
};

// -------------------------
// Обновление аватара
// -------------------------
export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new HttpError(STATUS_CODES.UNAUTHORIZED, 'Необходима авторизация'));
    }

    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      return next(new HttpError(STATUS_CODES.NOT_FOUND, 'Пользователь не найден'));
    }

    res.send(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return next(new HttpError(STATUS_CODES.BAD_REQUEST, 'Некорректный URL аватара'));
    }
    next(err);
  }
};
