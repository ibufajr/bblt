import './globals.css';
import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });
const tajawal = Tajawal({ 
  subsets: ['arabic'],
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: 'SmartBuild - AI Development Tool | بناء ذكي',
  description: 'AI-powered development tool for generating complete projects | أداة تطوير مدعومة بالذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${tajawal.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}