import type { Metadata } from 'next';
import '../styles/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CrowdParty — Play Together. Laugh Louder.',
  description: 'The all-in-one real-time multiplayer party games platform. Draw & Guess, Quiz Battle, Hot Takes, and Reaction Arena with zero downloads.',
  keywords: ['party games', 'multiplayer', 'remote team games', 'trivia', 'drawing game', 'hot takes', 'reaction game'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 flex flex-col min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
