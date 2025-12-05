import express from 'express';
import { getUploadToken, uploadAvatar } from '../controllers/uploadController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 获取上传凭证（需要登录）
router.get('/token', auth, getUploadToken);

// 上传头像（需要登录）
router.post('/avatar', auth, uploadAvatar);

export default router;
