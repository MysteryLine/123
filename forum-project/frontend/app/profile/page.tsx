'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import { api } from '@/lib/apiClient';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        avatar: '',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await api.auth.getCurrentUser();
            const userData = response.data.user;
            setUser(userData);
            setFormData({
                username: userData.username,
                bio: userData.bio || '',
                avatar: userData.avatar || '',
            });
        } catch (error) {
            console.error('获取用户信息失败:', error);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await api.auth.updateProfile(formData);
            setUser(response.data.user);
            setIsEditing(false);
            alert('资料更新成功！');
        } catch (error: any) {
            console.error('更新失败:', error);
            alert(error.response?.data?.message || '更新失败，请重试');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            bio: user?.bio || '',
            avatar: user?.avatar || '',
        });
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">加载中...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 头部 */}
                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5">
                    {/* 封面图 */}
                    <div className="h-36 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"></div>

                    {/* 用户信息 */}
                    <div className="px-6 pb-6">
                        <div className="flex items-start justify-between -mt-12">
                            <div className="flex items-end">
                                <Avatar
                                    src={user.avatar}
                                    username={user.username}
                                    size="large"
                                    className="border-4 border-white shadow-2xl"
                                />
                                <div className="ml-4 mt-12">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{user.username}</h1>
                                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">会员</span>
                                    </div>
                                    <p className="text-gray-500 mt-1">{user.email}</p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-12 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
                                >
                                    编辑资料
                                </button>
                            )}
                        </div>

                        {/* 简介 */}
                        {!isEditing && (
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">个人简介</h2>
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white/60">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {user.bio || '这个人很懒，还没有写简介...'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3">账户信息</h2>
                                    <div className="p-4 rounded-xl border border-gray-200 bg-white/60 space-y-2 text-sm text-gray-700">
                                        <div className="flex justify-between"><span>加入时间</span><span className="text-gray-500">{formatDate(user.createdAt)}</span></div>
                                        <div className="flex justify-between"><span>邮箱</span><span className="text-gray-500">{user.email}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 编辑表单 */}
                        {isEditing && (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                        minLength={3}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                                        头像 URL（可选）
                                    </label>
                                    <input
                                        type="url"
                                        id="avatar"
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        暂时请使用图片链接，后续会添加上传功能
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                        个人简介
                                    </label>
                                    <textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        placeholder="介绍一下自己吧..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        maxLength={500}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.bio.length}/500
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? '保存中...' : '保存修改'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* 统计信息（占位，可后续接入真实数据） */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center ring-1 ring-black/5">
                        <p className="text-3xl font-bold text-indigo-600">0</p>
                        <p className="text-sm text-gray-600 mt-1">发帖数</p>
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center ring-1 ring-black/5">
                        <p className="text-3xl font-bold text-green-600">0</p>
                        <p className="text-sm text-gray-600 mt-1">评论数</p>
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow p-6 text-center ring-1 ring-black/5">
                        <p className="text-3xl font-bold text-fuchsia-600">0</p>
                        <p className="text-sm text-gray-600 mt-1">获赞数</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
