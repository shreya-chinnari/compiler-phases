import { Header } from '@/components/header';
import { Analyzer } from '@/components/analyzer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Analyzer />
      </main>
    </div>
  );
}
