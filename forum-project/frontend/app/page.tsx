'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <main style={{ padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isLoggedIn ? (
        // 登录后的首页 — 导航卡片风格
        <div style={{ maxWidth: 1000, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem', color: '#fff' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>欢迎来到论坛社区</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>与众多爱好者交流分享你的想法</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* 查看帖子卡片 */}
            <Link href="/posts" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem', color: '#222' }}>浏览帖子</h2>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>查看社区中的热门讨论和精彩内容</p>
              </div>
            </Link>

            {/* 发布帖子卡片 */}
            <Link href="/posts/create" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem', color: '#222' }}>发布帖子</h2>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>分享你的想法和经验，与大家互动交流</p>
              </div>
            </Link>

            {/* 个人资料卡片 */}
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                padding: '2rem',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👤</div>
                <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem', color: '#222' }}>我的资料</h2>
                <p style={{ color: '#666', fontSize: '0.95rem' }}>查看和管理你的个人信息和设置</p>
              </div>
            </Link>
          </div>

          {/* 登出按钮 */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.8rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              登出
            </button>
          </div>
        </div>
      ) : (
        // 未登录的首页
        <div style={{ textAlign: 'center', color: '#fff', maxWidth: 600 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>论坛社区</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.9 }}>加入我们的社区，与志同道合的人交流分享</p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login">
              <button style={{
                padding: '0.8rem 2rem',
                background: '#fff',
                color: '#667eea',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                登录
              </button>
            </Link>
            <Link href="/register">
              <button style={{
                padding: '0.8rem 2rem',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
                注册
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
