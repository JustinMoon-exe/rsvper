import type { Metadata } from 'next';
import { Gayathri } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
import './globals.css';

const gayathri = Gayathri({
  subsets: ['latin'],
  weight: ['100', '400', '700'], 
  variable: '--font-gayathri',    
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Maria & Cole's Wedding RSVP",
  description: "Please RSVP for the wedding reception of Maria Parayil & Cole Pate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gayathri.variable} font-gayathri`}>
      <head />
      <body>{children}</body>
    </html>
  );
}