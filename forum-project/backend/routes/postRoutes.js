import express from 'express';
import {
  getAllPosts,
  createPost,
  getPost,
  deletePost,
  toggleLikePost,
} from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPosts);
router.post('/', auth, createPost);
router.get('/:id', getPost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLikePost);

export default router;
