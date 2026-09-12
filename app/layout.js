import './globals.css';
import SessionWrapper from '@/components/SessionWrapper';

export const metadata = {
  title: 'Workplace Hub - Next.js & MongoDB Order Management',
  description: 'Minimal, standard agency project & order management hub powered by Next.js, NextAuth and MongoDB Atlas.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
