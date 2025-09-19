import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';


import { Lexend , Montserrat} from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });

const inter = Inter({ subsets: ['latin'] });

const Monst = Montserrat({subsets: ['latin']})

export const metadata: Metadata = {
  title: 'Infinity Support Portal',
  description: 'NDIS form management system for Infinity Support Services',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={Monst.className}>
        <Providers>{children}</Providers>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
