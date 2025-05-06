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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Avoid hydration mismatch for client-side state
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    // Set initial code based on selected language only on client
    setCode(sampleCode[language]);
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
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);

    try {
       // Simulate network delay / heavy computation
       await new Promise(resolve => setTimeout(resolve, 500));
      const { tokens, symbolTable, lexemeStats } = analyzeCode(code, language);
      setTokens(tokens);
      setSymbolTable(symbolTable);
      setLexemeStats(lexemeStats);
      toast({
        title: "Analysis Complete",
        description: `Found ${tokens.length} tokens. Check results below.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
       toast({
         title: "Analysis Failed",
         description: "An unexpected error occurred during analysis. Check console for details.",
         variant: "destructive",
       });
       // Clear results on failure
        setTokens([]);
        setSymbolTable([]);
        setLexemeStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, toast]);

  const handleReset = useCallback(() => {
    setCode('');
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    toast({ title: "Reset Complete", description: "Editor and results cleared." });
  }, [toast]);

  const handleUseSample = useCallback(() => {
    setCode(sampleCode[language]);
     toast({ title: "Sample Code Loaded", description: `Loaded sample ${language.toUpperCase()} code.` });
  }, [language, toast]);

  const handleLanguageChange = (value: string) => {
    const newLang = value as 'java' | 'cpp';
    setLanguage(newLang);
    // Optionally, reset code or load new sample when language changes
    // setCode(sampleCode[newLang]); // Uncomment to auto-load sample on change
    // Or just reset everything:
    setCode('');
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
     toast({ title: "Language Changed", description: `Switched to ${newLang.toUpperCase()}.` });
  };


  if (!isClient) {
    // Render placeholder or null during server render / hydration phase
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="flex flex-col h-full">
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className='flex items-center gap-2'>
             <Select onValueChange={handleLanguageChange} value={language} disabled={isLoading}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUseSample} variant="outline" size="sm" disabled={isLoading}>
                <FileCode className="mr-1 h-4 w-4" /> Sample
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAnalyze} disabled={isLoading || !code.trim()} >
                <Play className="mr-1 h-4 w-4" /> {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="icon" disabled={isLoading}>
                <Trash2 className="h-4 w-4" />
                 <span className="sr-only">Reset</span>
              </Button>
            </div>
          </div>
          <div className="flex-grow h-[60vh] lg:h-auto">
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
        isLoading={isLoading}
      />
    </div>
  );
}
