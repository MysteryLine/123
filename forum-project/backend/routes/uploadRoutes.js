import express from 'express';
import { getUploadToken } from '../controllers/uploadController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 获取上传凭证（需要登录）
router.get('/token', auth, getUploadToken);

export default router;
