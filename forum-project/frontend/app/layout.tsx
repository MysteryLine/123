import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { LoadingProvider } from '@/components/LoadingContext';
import './globals.css';

export const metadata: Metadata = {
  title: '菊园 - 社区论坛',
  description: '菊园：一个现代化的社区论坛，分享观点，交流想法',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <LoadingProvider>
          <Navbar />
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
