import express from 'express';
import {
  addComment,
  deleteComment,
} from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.post('/', auth, addComment);
router.delete('/:commentId', auth, deleteComment);

export default router;
