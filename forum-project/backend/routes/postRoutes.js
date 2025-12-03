import express from 'express';
import {
  getAllPosts,
  createPost,
  getPost,
  deletePost,
} from '../controllers/postController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPosts);
router.post('/', auth, createPost);
router.get('/:id', getPost);
router.delete('/:id', auth, deletePost);

export default router;
