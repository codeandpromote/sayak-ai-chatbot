import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sayak AI Chatbot - Dashboard',
  description: 'Manage your AI chatbots, knowledge base, and conversations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
