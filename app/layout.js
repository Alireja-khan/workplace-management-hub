import './globals.css';
import SessionWrapper from '@/components/SessionWrapper';

export const metadata = {
  title: 'Workplace Hub - Next.js & MongoDB Order Management',
  description: 'Minimal, standard agency project & order management hub powered by Next.js, NextAuth and MongoDB Atlas.',
  icons: {
    icon: [
      {
        url: '/logo-black.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo-white.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo-black.png',
      }
    ],
    apple: '/logo-black.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-black.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-white.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
