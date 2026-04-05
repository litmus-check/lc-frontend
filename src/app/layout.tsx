import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Fraunces, Hanken_Grotesk } from 'next/font/google'
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers from "@/components/Providers";
import Script from 'next/script';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Litmus Check',
    template: '%s - Litmus Check',
  },
  description: 'Automate QA with Litmus AI, Ship Faster.',
  metadataBase: new URL('https://litmuscheck.com'),
  openGraph: {
    title: 'Litmus Check',
    description: 'Automate QA with Litmus AI, Ship Faster.',
    url: 'https://litmuscheck.com',
    siteName: 'Litmus Check',
    images: ['/opengraph-image.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Litmus Check',
    description: 'Automate QA with Litmus AI, Ship Faster.',
    images: ['/opengraph-image.jpg']
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

const queryClient = new QueryClient();
export default function RootLayout({ children }: RootLayoutProps) {
  return (
      <html lang='en' suppressHydrationWarning className='scroll-smooth'>
        <head>
        {process.env.NEXT_PUBLIC_ENV === "PROD" && (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=AW-17762666075"
              strategy="beforeInteractive"
            />
            <Script id="google-ads" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17762666075');
              `}
            </Script>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-9CVKN20K83"
              strategy="beforeInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-9CVKN20K83');
              `}
            </Script>
          </>
        )}
        </head>
        <body
          className={cn(
            hankenGrotesk.variable,
            hankenGrotesk.className,
            fraunces.variable,
            'min-h-screen flex flex-col bg-background antialiased'
          )}
        >
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#AE00FF",
                colorInfo: "#4542CC",
                lineWidth: 2,
              },
              components: {
                Table: {
                  colorPrimary: "#AE00FF",
                  colorLink: "#DD94FF",
                  colorLinkHover: "#AE00FF",
                },
                Button: {
                  colorPrimary: "#AE00FF",
                  colorPrimaryHover: "#AE00FF",
                  colorInfo: "#4542CC",
                  colorInfoHover: "#4542CC",
                },
              },
            }}
          >
              <Providers>
                {children}
              </Providers>
          </ConfigProvider>
        </body>
      </html>
  )
}
