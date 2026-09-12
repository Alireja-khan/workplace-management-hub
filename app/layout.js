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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-black.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-white.png" media="(prefers-color-scheme: dark)" />
        {/* Instant blocking theme script to prevent Theme Flash / Flickering on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('vercel_hub_theme');
                  var theme = saved || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
