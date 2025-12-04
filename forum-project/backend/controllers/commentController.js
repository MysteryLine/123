import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// 添加评论
export const addComment = async (req, res) => {
  try {
    const { content, images } = req.body;
    const { postId } = req.params;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '评论内容是必需的',
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
      });
    }

    const comment = new Comment({
      content,
      images: images || [],
      author: req.userId,
      post: postId,
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    post.comments.push(comment._id);
    await post.save();

    res.status(201).json({
      success: true,
      message: '评论添加成功',
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加评论失败',
      error: error.message,
    });
  }
};

// 删除评论
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在',
      });
    }

    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此评论',
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: req.params.commentId },
    });

    res.status(200).json({
      success: true,
      message: '评论删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message,
    });
  }
};

// 点赞/取消点赞评论
export const toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在',
      });
    }

    const userId = req.userId;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      // 已点赞，取消点赞
      comment.likes.splice(likeIndex, 1);
    } else {
      // 未点赞，添加点赞
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? '取消点赞' : '点赞成功',
      likesCount: comment.likes.length,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message,
    });
  }
};
