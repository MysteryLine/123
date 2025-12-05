import express from 'express';
import {
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
} from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', auth, addComment);
router.put('/:commentId', auth, updateComment);
router.delete('/:commentId', auth, deleteComment);
router.post('/:commentId/like', auth, toggleLikeComment);

export default router;
