import { Router } from 'express';
import usersRouter from './users';
import cardsRouter from './cards';

const mainRouter = Router();

mainRouter.use('/users', usersRouter);
mainRouter.use('/cards', cardsRouter);

export default mainRouter;
