import { Request, Response } from 'express';
import User from '../models/user';
import { RequestWithUser } from '../types';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
    }

    return res.send(user);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Передан некорректный _id пользователя',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, about, avatar } = req.body;

  try {
    const user = await User.create({ name, about, avatar });
    return res.status(201).send(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные при создании пользователя',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateUser = async (req: RequestWithUser, res: Response) => {
  const { name, about } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).send({ message: 'Пользователь с указанным _id не найден' });
    }

    return res.send(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Передан некорректный _id пользователя',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateUserAvatar = async (req: RequestWithUser, res: Response) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).send({ message: 'Пользователь с указанным _id не найден' });
    }

    return res.send(user);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные при обновлении аватара',
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Передан некорректный _id пользователя',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
