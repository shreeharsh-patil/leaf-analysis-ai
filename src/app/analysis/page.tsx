import { Leaf } from 'lucide-react';
import LeafyAiClient from '@/components/leafy-ai-client';
import Link from 'next/link';

export default function AnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">LeafyAI</h1>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <LeafyAiClient />
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js and Genkit.
          </p>
        </div>
      </footer>
    </div>
  );
}
