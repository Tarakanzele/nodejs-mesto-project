import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import mainRouter from './routes/index';
import { requestLogger } from './middlewares/request-logger';
import { errorLogger } from './middlewares/error-logger';
import auth from './middlewares/auth';
import errorHandler from './errors/error-handler';
import { validateSignup, validateSignin } from './middlewares/validators';
import { createUser, login } from './controllers/users';
import { errors } from 'celebrate';

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Логирование запросов
app.use(requestLogger);

// Открытые руты
app.post('/signup', validateSignup, createUser);
app.post('/signin', validateSignin, login);

// Авторизация
app.use(auth);

// Защищённые руты
app.use('/', mainRouter);

// Логирование ошибок
app.use(errorLogger);

// Celebrate ошибки
app.use(errors());

// Централизованный обработчик ошибок
app.use(errorHandler);

mongoose
  .connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(console.error);
