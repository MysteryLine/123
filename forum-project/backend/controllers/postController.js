import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// 获取所有帖子
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取帖子失败',
      error: error.message,
    });
  }
};

// 创建帖子
export const createPost = async (req, res) => {
  try {
    const { title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容是必需的',
      });
    }

    const post = new Post({
      title,
      content,
      images: images || [],
      author: req.userId,
    });

    await post.save();
    await post.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建帖子失败',
      error: error.message,
    });
  }
};

// 获取单个帖子
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar' },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
      });
    }

    // 增加浏览次数
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取帖子失败',
      error: error.message,
    });
  }
};

// 删除帖子
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
      });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此帖子',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: '帖子删除成功',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除帖子失败',
      error: error.message,
    });
  }
};

// 点赞/取消点赞帖子
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
      });
    }

    const userId = req.userId;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // 已点赞，取消点赞
      post.likes.splice(likeIndex, 1);
    } else {
      // 未点赞，添加点赞
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? '取消点赞' : '点赞成功',
      likesCount: post.likes.length,
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
