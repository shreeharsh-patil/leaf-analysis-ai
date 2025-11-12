import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, ArrowRight } from 'lucide-react';

export default function IntroPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background text-foreground p-4 overflow-hidden">
      <div className="text-center space-y-4 animate-in fade-in-down duration-1000">
        <Leaf className="mx-auto h-16 w-16 text-primary" />
        <h1 className="text-6xl font-cursive tracking-tighter">Leaf Analysis</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-headline">
          Your AI-powered assistant for detecting plant diseases. Upload an image of a leaf to get started.
        </p>
      </div>
      <div className="mt-8 animate-in fade-in-up duration-1000 delay-300">
        <Button asChild size="lg">
          <Link href="/analysis">
            Start Analysis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
       <footer className="absolute bottom-0 py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          
        </div>
      </footer>
    </div>
  );
}
