import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { REGION_CONFIG, getSiteBaseUrl } from '@/config/region';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  title: {
    default: `${REGION_CONFIG.brandName} | Back Our Own Trades in Crewe, Nantwich & Sandbach (CW1–CW11)`,
    template: `%s | ${REGION_CONFIG.brandName}`,
  },
  description: REGION_CONFIG.heroSubtitle,
  keywords: [
    'Crewe local tradespeople',
    'Nantwich plumbers',
    'Sandbach electricians',
    'South Cheshire Locals',
    'CW1 CW2 CW5 CW11 trades',
    'Crewe community recommended trades',
    'back local South Cheshire',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={jakarta.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
