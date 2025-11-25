import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
  getCurrentUser,
} from '../controllers/users';

import {
  validateUserId,
  validateUpdateProfile,
  validateUpdateAvatar,
} from '../middlewares/validators';

const router = Router();

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUserById);
router.patch('/me', validateUpdateProfile, updateUser);
router.patch('/me/avatar', validateUpdateAvatar, updateUserAvatar);

export default router;
