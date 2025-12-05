import express from 'express';
import { register, login, getCurrentUser, updateProfile, getUserProfile, followUser, unfollowUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.get('/user/:userId', getUserProfile);
router.post('/follow/:userId', auth, followUser);
router.post('/unfollow/:userId', auth, unfollowUser);

export default router;
