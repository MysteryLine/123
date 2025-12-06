import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { createNotification } from './notificationController.js';

// 用户注册
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证必需字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码是必需的',
      });
    }

    // 验证用户名长度
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: '用户名至少需要 3 个字符',
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的邮箱地址',
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少需要 6 个字符',
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册',
        });
      } else {
        return res.status(400).json({
          success: false,
          message: '该用户名已被使用',
        });
      }
    }

    // 创建新用户
    const user = new User({ username, email, password });
    await user.save();

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '注册失败',
      error: error.message,
    });
  }
};

// 用户登录
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必需字段
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码是必需的',
      });
    }

    // 查找用户
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      });
    }

    // 验证密码
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message,
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message,
    });
  }
};

// 更新用户资料
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 如果更新用户名，检查是否已被使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已被使用',
        });
      }
      user.username = username;
    }

    // 更新其他字段
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: '资料更新成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新资料失败',
      error: error.message,
    });
  }
};

// 获取用户公开资料（包括粉丝数和关注数）
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('following', 'username avatar')
      .populate('followers', 'username avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户资料失败',
      error: error.message,
    });
  }
};

// 关注用户
export const followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: '不能关注自己',
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 检查是否已关注
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: '已关注该用户',
      });
    }

    // 添加到关注列表
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    // 创建通知（通知被关注的用户）
    await createNotification(targetUserId, currentUserId, 'follow');

    res.status(200).json({
      success: true,
      message: '关注成功',
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '关注失败',
      error: error.message,
    });
  }
};

// 取消关注用户
export const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 从关注列表移除
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: '取消关注成功',
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消关注失败',
      error: error.message,
    });
  }
};
