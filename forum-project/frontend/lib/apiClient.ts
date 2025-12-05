import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加 JWT token
apiClient.interceptors.request.use(
  (config) => {
    // 确保在浏览器环境中才访问 localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API 方法
export const api = {
  // 认证相关
  auth: {
    register: (data: { username: string; email: string; password: string }) =>
      apiClient.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    getCurrentUser: () => apiClient.get('/auth/me'),
    updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
      apiClient.put('/auth/profile', data),
    getUserProfile: (userId: string) =>
      apiClient.get(`/auth/user/${userId}`),
    followUser: (userId: string) =>
      apiClient.post(`/auth/follow/${userId}`),
    unfollowUser: (userId: string) =>
      apiClient.post(`/auth/unfollow/${userId}`),
  },

  // 帖子相关
  posts: {
    getAll: (page: number = 1, limit: number = 10) =>
      apiClient.get(`/posts?page=${page}&limit=${limit}`),
    getById: (id: string) => apiClient.get(`/posts/${id}`),
    getUserPosts: (userId: string, page: number = 1, limit: number = 10) =>
      apiClient.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
    create: (data: { title: string; content: string; images?: string[] }) =>
      apiClient.post('/posts', data),
    update: (id: string, data: { title?: string; content?: string; images?: string[] }) =>
      apiClient.put(`/posts/${id}`, data),
    delete: (id: string) => apiClient.delete(`/posts/${id}`),
    toggleLike: (id: string) => apiClient.post(`/posts/${id}/like`),
  },

  // 评论相关
  comments: {
    add: (postId: string, content: string, images?: string[]) =>
      apiClient.post(`/posts/${postId}/comments`, { content, images }),
    update: (postId: string, commentId: string, content: string, images?: string[]) =>
      apiClient.put(`/posts/${postId}/comments/${commentId}`, { content, images }),
    delete: (postId: string, commentId: string) =>
      apiClient.delete(`/posts/${postId}/comments/${commentId}`),
    toggleLike: (postId: string, commentId: string) =>
      apiClient.post(`/posts/${postId}/comments/${commentId}/like`),
  },

  // 上传相关
  upload: {
    getToken: () => apiClient.get('/upload/token'),
    uploadAvatar: (avatarBase64: string) =>
      apiClient.post('/upload/avatar', { avatarBase64 }),
  },
};

export default apiClient;
