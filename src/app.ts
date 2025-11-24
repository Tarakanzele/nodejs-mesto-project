import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import mainRouter from './routes/index';
import { RequestWithUser } from './types';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  (req as RequestWithUser).user = {
    _id: '6924766a9dbb1d6291809312',
  };

  next();
});

app.use('/', mainRouter);

app.use((req: Request, res: Response) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
