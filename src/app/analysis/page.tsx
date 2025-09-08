import { Leaf } from 'lucide-react';
import LeafAnalysisClient from '@/components/leaf-analysis-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 z-50 w-full bg-transparent">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-background/50 backdrop-blur-sm p-2 rounded-full border border-transparent group-hover:border-primary/50 transition-colors">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">Leaf Analysis</h1>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <LeafAnalysisClient />
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          
        </div>
      </footer>
    </div>
  );
}
