import express from 'express';
import {
  addComment,
  deleteComment,
  toggleLikeComment,
} from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', auth, addComment);
router.delete('/:commentId', auth, deleteComment);
router.post('/:commentId/like', auth, toggleLikeComment);

export default router;
