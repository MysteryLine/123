import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被使用',
      });
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
    res.status(500).json({
      success: false,
      message: '注册失败',
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
