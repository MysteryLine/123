import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '论坛社区',
  description: '一个现代化的论坛社区网站',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
