import { Request, Response } from 'express';
import Card from '../models/card';
import { RequestWithUser } from '../types';

export const getCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (err) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createCard = async (req: RequestWithUser, res: Response) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  try {
    const card = await Card.create({
      name,
      link,
      owner,
    });

    return res.status(201).send(card);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные при создании карточки',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const deleteCard = async (req: RequestWithUser, res: Response) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      return res.status(404).send({
        message: 'Карточка с указанным _id не найдена',
      });
    }

    if (card.owner.toString() !== req.user._id) {
      return res.status(403).send({
        message: 'Недостаточно прав для удаления данной карточки',
      });
    }

    const deletedCard = await Card.findByIdAndDelete(req.params.cardId);
    return res.send(deletedCard);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Передан некорректный _id карточки',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const likeCard = async (req: RequestWithUser, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return res.status(404).send({
        message: 'Передан несуществующий _id карточки',
      });
    }

    return res.send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные для постановки лайка или некорректный _id карточки',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const dislikeCard = async (req: RequestWithUser, res: Response) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      return res.status(404).send({
        message: 'Передан несуществующий _id карточки',
      });
    }

    return res.send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      return res.status(400).send({
        message: 'Переданы некорректные данные для снятия лайка или некорректный _id карточки',
      });
    }

    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
