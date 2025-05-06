import { ModeToggle } from "@/components/mode-toggle";
import { Code } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
           <Code className="h-6 w-6 text-accent" />
          <h1 className="text-xl font-bold tracking-tight">Code Insights Analyzer</h1>
        </div>
        <div className="flex items-center space-x-4">
           <span className="text-sm text-muted-foreground hidden sm:inline">Lexical Analyzer for Java & C++</span>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
