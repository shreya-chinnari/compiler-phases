"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from '@/components/code-editor';
import { AnalysisResults } from '@/components/analysis-results';
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import { analyzeCode } from '@/lib/lexer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Trash2, FileCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { sampleCode } from '@/lib/sample-code';


export function Analyzer() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<'java' | 'cpp'>('java');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [symbolTable, setSymbolTable] = useState<SymbolTableEntry[]>([]);
  const [lexemeStats, setLexemeStats] = useState<LexemeStat[]>([]);
  const [tac, setTac] = useState<string[]>([]); // Added state for TAC
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Avoid hydration mismatch for client-side state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Set initial code based on selected language only on client
    setCode(sampleCode[language]);
     // Reset results when language changes
     setTokens([]);
     setSymbolTable([]);
     setLexemeStats([]);
     setTac([]);
  }, [language]); // Rerun when language changes

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
       toast({
         title: "Input Required",
         description: "Please enter some code to analyze.",
         variant: "destructive",
       });
      return;
    }
    setIsLoading(true);
    // Reset all results before analysis
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);

    try {
       // Simulate network delay / heavy computation
       await new Promise(resolve => setTimeout(resolve, 500));
      const { tokens, symbolTable, lexemeStats, tac } = analyzeCode(code, language);
      setTokens(tokens);
      setSymbolTable(symbolTable);
      setLexemeStats(lexemeStats);
      setTac(tac); // Set the generated TAC
      toast({
        title: "Analysis Complete",
        description: `Found ${tokens.length} tokens. Check results below.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
       toast({
         title: "Analysis Failed",
         description: `An unexpected error occurred during analysis. ${error instanceof Error ? error.message : 'Check console for details.'}`,
         variant: "destructive",
       });
       // Clear results on failure
        setTokens([]);
        setSymbolTable([]);
        setLexemeStats([]);
        setTac([]);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, toast]);

  const handleReset = useCallback(() => {
    setCode('');
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]); // Reset TAC
    toast({ title: "Reset Complete", description: "Editor and results cleared." });
  }, [toast]);

  const handleUseSample = useCallback(() => {
    setCode(sampleCode[language]);
    // Optionally reset results when loading sample code
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
     toast({ title: "Sample Code Loaded", description: `Loaded sample ${language.toUpperCase()} code.` });
  }, [language, toast]);

  const handleLanguageChange = (value: string) => {
    const newLang = value as 'java' | 'cpp';
    setLanguage(newLang);
    // Reset code and results when language changes to avoid confusion
    setCode(sampleCode[newLang]); // Load new sample for the selected language
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
     toast({ title: "Language Changed", description: `Switched to ${newLang.toUpperCase()}. Sample loaded.` });
  };


  if (!isClient) {
    // Render placeholder or null during server render / hydration phase
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-theme(spacing.24))]"> {/* Adjust height */}
      {/* Add border and shadow to the code input card */}
      <Card className="flex flex-col h-full border-primary shadow-lg bg-gradient-to-br from-background to-secondary/20 rounded-xl">
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className='flex items-center gap-2'>
             {/* Style the select dropdown */}
             <Select onValueChange={handleLanguageChange} value={language} disabled={isLoading}>
                 <SelectTrigger className="w-[120px] bg-card border-accent focus:ring-accent/50">
                   <SelectValue placeholder="Language" />
                 </SelectTrigger>
                 <SelectContent className="bg-popover border-accent shadow-lg">
                   <SelectItem value="java">Java</SelectItem>
                   <SelectItem value="cpp">C++</SelectItem>
                 </SelectContent>
               </Select>
               {/* Style the Sample button */}
               <Button onClick={handleUseSample} variant="secondary" size="sm" disabled={isLoading}>
                 <FileCode className="mr-1 h-4 w-4" /> Sample
               </Button>
            </div>

            <div className="flex gap-2">
               {/* Style the Analyze button */}
               <Button onClick={handleAnalyze} disabled={isLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <Play className="mr-1 h-4 w-4" /> {isLoading ? 'Analyzing...' : 'Analyze'}
               </Button>
               {/* Style the Reset button */}
               <Button onClick={handleReset} variant="outline" size="icon" disabled={isLoading} className="border-destructive text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Reset</span>
               </Button>
            </div>
          </div>
          {/* Ensure CodeEditor container allows growth */}
           <div className="flex-grow min-h-[40vh] lg:min-h-0 border border-accent/50 rounded-md overflow-hidden shadow-inner"> {/* Added border, rounded, overflow, shadow */}
             <CodeEditor
              language={language}
              value={code}
              onChange={(value) => setCode(value ?? '')}
            />
          </div>
        </CardContent>
      </Card>

      <AnalysisResults
        tokens={tokens}
        symbolTable={symbolTable}
        lexemeStats={lexemeStats}
        tac={tac} // Pass TAC data
        isLoading={isLoading}
      />
    </div>
  );
}
