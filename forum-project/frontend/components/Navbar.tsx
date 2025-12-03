'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { api } from '@/lib/apiClient';

const Navbar: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.auth.getCurrentUser();
                    setUser(response.data.user);
                } catch (error) {
                    console.log('未登录');
                }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <nav style={{
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#0ea5ff',
                        cursor: 'pointer',
                    }}>
                        📝 论坛社区
                    </div>
                </Link>

                {/* 导航链接 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link href="/" style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontWeight: 500,
                        transition: 'color 0.2s',
                    }}>
                        首页
                    </Link>
                    <Link href="/posts/create" style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontWeight: 500,
                        transition: 'color 0.2s',
                    }}>
                        发帖
                    </Link>

                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <Avatar src={user.avatar} username={user.username} size="small" />
                                <span style={{ fontWeight: 500, color: '#333' }}>{user.username}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ width: 16, height: 16, transition: 'transform 0.2s', transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {isMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '0.5rem',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    minWidth: '160px',
                                    overflow: 'hidden',
                                }}>
                                    <Link href="/profile" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            color: '#333',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            👤 我的资料
                                        </div>
                                    </Link>
                                    <div
                                        onClick={handleLogout}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            color: '#e53e3e',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            borderTop: '1px solid #f0f0f0',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        🚪 退出登录
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href="/login">
                                <button style={{
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    color: '#0ea5ff',
                                    border: '1px solid #0ea5ff',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}>
                                    登录
                                </button>
                            </Link>
                            <Link href="/register">
                                <button style={{
                                    padding: '0.5rem 1rem',
                                    background: '#0ea5ff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}>
                                    注册
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
