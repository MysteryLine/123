'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoading } from './LoadingContext';

interface LoadingLinkProps extends Omit<LinkProps, 'href'> {
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    showLoading?: boolean; // 是否显示加载动画，默认 true
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; // 自定义点击处理器
}

export default function LoadingLink({
    href,
    children,
    className,
    style,
    showLoading = true,
    onClick,
    ...props
}: LoadingLinkProps) {
    const router = useRouter();
    const { showLoading: showLoadingAnimation, hideLoading } = useLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // 先执行自定义的 onClick
        if (onClick) {
            onClick(e);
        }

        // 如果已经阻止了默认行为，不继续
        if (e.defaultPrevented) {
            return;
        }

        // 如果是外部链接或特殊协议，不做处理
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        // 如果禁用了加载动画，使用默认行为
        if (!showLoading) {
            return;
        }

        // 阻止默认行为
        e.preventDefault();

        // 显示加载动画
        showLoadingAnimation();

        // 延迟导航，让加载动画显示
        setTimeout(() => {
            router.push(href);
            // 给页面一些时间加载
            setTimeout(() => {
                hideLoading();
            }, 500);
        }, 100);
    };

    return (
        <Link href={href} onClick={handleClick} className={className} style={style} {...props}>
            {children}
        </Link>
    );
}
