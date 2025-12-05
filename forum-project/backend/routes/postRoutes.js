import express from 'express';
import {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getUserPosts,
} from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.post('/', auth, createPost);
router.get('/:id', getPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, toggleLikePost);

export default router;
