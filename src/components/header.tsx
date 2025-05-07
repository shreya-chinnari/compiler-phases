import { ModeToggle } from "@/components/mode-toggle";
import { Code } from "lucide-react";

export function Header() {
  return (
     // Add gradient background and subtle shadow
     <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-background via-secondary/30 to-background/90 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-background/80 supports-[backdrop-filter]:via-secondary/50 supports-[backdrop-filter]:to-background/70 shadow-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
           {/* Use primary color for the icon */}
           <Code className="h-6 w-6 text-primary" />
           {/* Style the title text */}
           <h1 className="text-xl font-bold tracking-tight text-foreground">Compiler design phases</h1>
        </div>
        <div className="flex items-center space-x-4">
           {/* Style the subtitle text */}
           <span className="text-sm text-muted-foreground hidden sm:inline">Lexical Analyzer for Java & C++</span>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
