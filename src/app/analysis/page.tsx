import { Leaf } from 'lucide-react';
import LeafAnalysisClient from '@/components/leaf-analysis-client';
import Link from 'next/link';

export default function AnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
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
