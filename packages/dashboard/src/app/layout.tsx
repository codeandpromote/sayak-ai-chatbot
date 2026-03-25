import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sayak AI Chatbot - AI-Powered Customer Support',
  description: 'Train a custom AI chatbot on your content. It answers customer questions, captures leads, and books appointments automatically.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
