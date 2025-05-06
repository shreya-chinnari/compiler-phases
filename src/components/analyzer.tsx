
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from '@/components/code-editor';
import { AnalysisResults } from '@/components/analysis-results';
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import { analyzeCode } from '@/lib/lexer';
import { generateMachineCode } from '@/ai/flows/generate-machine-code-flow';
import { generateIntermediateCode, type GenerateIntermediateCodeOutput } from '@/ai/flows/generate-intermediate-code-flow';
import { analyzeSyntax, type AnalyzeSyntaxOutput } from '@/ai/flows/analyze-syntax-flow';
import { analyzeSemantics, type AnalyzeSemanticsOutput } from '@/ai/flows/analyze-semantics-flow';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Trash2, FileCode, Cpu, ScanSearch, Network, Shuffle, Loader2, Wand2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { sampleCode } from '@/lib/sample-code';


export function Analyzer() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<'java' | 'cpp'>('java');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [symbolTable, setSymbolTable] = useState<SymbolTableEntry[]>([]);
  const [lexemeStats, setLexemeStats] = useState<LexemeStat[]>([]);
  const [tac, setTac] = useState<string[]>([]);
  const [machineCode, setMachineCode] = useState<string[]>([]);
  const [intermediateCode, setIntermediateCode] = useState<GenerateIntermediateCodeOutput | null>(null);
  const [syntaxAnalysis, setSyntaxAnalysis] = useState<AnalyzeSyntaxOutput | null>(null);
  const [semanticAnalysis, setSemanticAnalysis] = useState<AnalyzeSemanticsOutput | null>(null);

  const [isLexicalLoading, setIsLexicalLoading] = useState<boolean>(false);
  const [isMachineCodeLoading, setIsMachineCodeLoading] = useState<boolean>(false);
  const [isIntermediateCodeLoading, setIsIntermediateCodeLoading] = useState<boolean>(false);
  const [isSyntaxLoading, setIsSyntaxLoading] = useState<boolean>(false);
  const [isSemanticsLoading, setIsSemanticsLoading] = useState<boolean>(false);
  const [isAllLoading, setIsAllLoading] = useState<boolean>(false);


  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    setCode(sampleCode[language]);
     setTokens([]);
     setSymbolTable([]);
     setLexemeStats([]);
     setTac([]);
     setMachineCode([]);
     setIntermediateCode(null);
     setSyntaxAnalysis(null);
     setSemanticAnalysis(null);
  }, []); // Load sample code once on initial mount based on default language

  const handleAnalyzeLexical = useCallback(async (showToasts = true): Promise<boolean> => {
    if (!code.trim()) {
       if (showToasts) toast({ title: "Input Required", description: "Please enter some code to analyze.", variant: "destructive" });
      return false;
    }
    setIsLexicalLoading(true);
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);

    try {
       await new Promise(resolve => setTimeout(resolve, 300)); // Simulate short delay
      const { tokens, symbolTable, lexemeStats, tac } = analyzeCode(code, language);
      setTokens(tokens);
      setSymbolTable(symbolTable);
      setLexemeStats(lexemeStats);
      setTac(tac);
      if (showToasts) toast({ title: "Lexical Analysis Complete", description: `Found ${tokens.length} tokens.` });
      return true;
    } catch (error) {
      console.error("Lexical analysis error:", error);
       if (showToasts) toast({ title: "Lexical Analysis Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
        setTokens([]);
        setSymbolTable([]);
        setLexemeStats([]);
        setTac([]);
      return false;
    } finally {
      setIsLexicalLoading(false);
    }
  }, [code, language, toast]);

  const handleGenerateMachineCode = useCallback(async (showToasts = true): Promise<boolean> => {
      if (!code.trim()) {
         if (showToasts) toast({ title: "Input Required", description: "Please enter code.", variant: "destructive" });
        return false;
      }
      setIsMachineCodeLoading(true);
      setMachineCode([]);
      try {
        const result = await generateMachineCode({ code, language });
        setMachineCode(result.machineCode);
        if (showToasts) toast({ title: "Machine Code Generated", description: `Successfully generated instructions.` });
        return true;
      } catch (error) {
        console.error("Machine code generation error:", error);
         if (showToasts) toast({ title: "MC Generation Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
         setMachineCode([]);
         return false;
      } finally {
        setIsMachineCodeLoading(false);
      }
    }, [code, language, toast]);

   const handleGenerateIntermediateCode = useCallback(async (showToasts = true): Promise<boolean> => {
       if (!code.trim()) {
          if (showToasts) toast({ title: "Input Required", description: "Please enter code.", variant: "destructive" });
         return false;
       }
       setIsIntermediateCodeLoading(true);
       setIntermediateCode(null);
       try {
         const result = await generateIntermediateCode({ code, language });
         setIntermediateCode(result);
         if (showToasts) toast({ title: "Intermediate Code Generated (AI)", description: `Successfully generated IC representations.` });
         return true;
       } catch (error) {
         console.error("Intermediate code generation error:", error);
          if (showToasts) toast({ title: "IC Generation Failed (AI)", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
          setIntermediateCode(null);
          return false;
       } finally {
         setIsIntermediateCodeLoading(false);
       }
     }, [code, language, toast]);

  const handleAnalyzeSyntax = useCallback(async (showToasts = true): Promise<boolean> => {
    if (!code.trim()) {
      if (showToasts) toast({ title: "Input Required", description: "Please enter code for syntax analysis.", variant: "destructive" });
      return false;
    }
    setIsSyntaxLoading(true);
    setSyntaxAnalysis(null);
    try {
      const result = await analyzeSyntax({ code, language });
      setSyntaxAnalysis(result);
      if (showToasts) toast({ title: "Syntax Analysis Complete", description: result.parseStatus });
      return true;
    } catch (error) {
      console.error("Syntax analysis error:", error);
      if (showToasts) toast({ title: "Syntax Analysis Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
      setSyntaxAnalysis(null);
      return false;
    } finally {
      setIsSyntaxLoading(false);
    }
  }, [code, language, toast]);

  const handleAnalyzeSemantics = useCallback(async (showToasts = true): Promise<boolean> => {
    if (!code.trim()) {
      if (showToasts) toast({ title: "Input Required", description: "Please enter code for semantic analysis.", variant: "destructive" });
      return false;
    }
    setIsSemanticsLoading(true);
    setSemanticAnalysis(null);
    try {
      const result = await analyzeSemantics({ code, language });
      setSemanticAnalysis(result);
      if (showToasts) toast({ title: "Semantic Analysis Complete", description: result.analysisSummary });
      return true;
    } catch (error) {
      console.error("Semantic analysis error:", error);
      if (showToasts) toast({ title: "Semantic Analysis Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
      setSemanticAnalysis(null);
      return false;
    } finally {
      setIsSemanticsLoading(false);
    }
  }, [code, language, toast]);

  const handleAnalyzeAll = useCallback(async () => {
    if (!code.trim()) {
      toast({ title: "Input Required", description: "Please enter code to analyze.", variant: "destructive" });
      return;
    }
    setIsAllLoading(true);
    toast({ title: "Full Analysis Started", description: "Processing all phases..." });

    let success = await handleAnalyzeLexical(false);
    if (!success) {
      toast({ title: "Full Analysis Halted", description: "Lexical analysis failed.", variant: "destructive" });
      setIsAllLoading(false);
      return;
    }
    toast({ title: "Lexical Analysis Complete", description: "Proceeding to Syntax Analysis." });

    success = await handleAnalyzeSyntax(false);
    if (!success) {
      toast({ title: "Full Analysis Halted", description: "Syntax analysis failed.", variant: "destructive" });
      setIsAllLoading(false);
      return;
    }
    toast({ title: "Syntax Analysis Complete", description: "Proceeding to Semantic Analysis." });

    success = await handleAnalyzeSemantics(false);
    if (!success) {
      toast({ title: "Full Analysis Halted", description: "Semantic analysis failed.", variant: "destructive" });
      setIsAllLoading(false);
      return;
    }
    toast({ title: "Semantic Analysis Complete", description: "Proceeding to Intermediate Code Generation." });

    success = await handleGenerateIntermediateCode(false);
    if (!success) {
      toast({ title: "Full Analysis Halted", description: "Intermediate Code generation failed.", variant: "destructive" });
      setIsAllLoading(false);
      return;
    }
    toast({ title: "Intermediate Code Generation Complete", description: "Proceeding to Machine Code Generation." });
    
    success = await handleGenerateMachineCode(false);
    if (!success) {
      toast({ title: "Full Analysis Halted", description: "Machine Code generation failed.", variant: "destructive" });
      setIsAllLoading(false);
      return;
    }
    
    toast({ title: "Full Analysis Complete!", description: "All phases processed successfully." });
    setIsAllLoading(false);
  }, [code, language, toast, handleAnalyzeLexical, handleAnalyzeSyntax, handleAnalyzeSemantics, handleGenerateIntermediateCode, handleGenerateMachineCode]);


  const handleReset = useCallback(() => {
    setCode(sampleCode[language]); 
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
    setMachineCode([]);
    setIntermediateCode(null);
    setSyntaxAnalysis(null);
    setSemanticAnalysis(null);
    toast({ title: "Reset Complete", description: "Editor and results cleared. Sample code loaded." });
  }, [language, toast]);

  const handleUseSample = useCallback(() => {
    setCode(sampleCode[language]);
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
    setMachineCode([]);
    setIntermediateCode(null);
    setSyntaxAnalysis(null);
    setSemanticAnalysis(null);
     toast({ title: "Sample Code Loaded", description: `Loaded sample ${language.toUpperCase()} code.` });
  }, [language, toast]);

  const handleLanguageChange = (value: string) => {
    const newLang = value as 'java' | 'cpp';
    setLanguage(newLang);
    setCode(sampleCode[newLang]); 
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
    setMachineCode([]);
    setIntermediateCode(null);
    setSyntaxAnalysis(null);
    setSemanticAnalysis(null);
     toast({ title: "Language Changed", description: `Switched to ${newLang.toUpperCase()}. Sample code loaded and results cleared.` });
  };

  const anyIndividualLoading = isLexicalLoading || isMachineCodeLoading || isIntermediateCodeLoading || isSyntaxLoading || isSemanticsLoading;
  const anyLoading = anyIndividualLoading || isAllLoading;

  if (!isClient) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-theme(spacing.24)-2rem)]">
      <Card className="flex flex-col h-full border-primary shadow-lg bg-gradient-to-br from-background to-secondary/20 rounded-xl">
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className='flex items-center gap-2'>
             <Select onValueChange={handleLanguageChange} value={language} disabled={anyLoading}>
                 <SelectTrigger className="w-[120px] bg-card border-accent focus:ring-accent/50">
                   <SelectValue placeholder="Language" />
                 </SelectTrigger>
                 <SelectContent className="bg-popover border-accent shadow-lg">
                   <SelectItem value="java">Java</SelectItem>
                   <SelectItem value="cpp">C++</SelectItem>
                 </SelectContent>
               </Select>
               <Button onClick={handleUseSample} variant="secondary" size="sm" disabled={anyLoading} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                 <FileCode className="mr-1 h-4 w-4" /> Sample
               </Button>
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
               <Button 
                  onClick={handleAnalyzeAll} 
                  disabled={anyLoading || !code.trim()} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
                >
                 <Wand2 className="mr-1 h-4 w-4" /> {isAllLoading ? 'Analyzing All...' : 'Analyze All'}
               </Button>
               <Button onClick={() => handleAnalyzeLexical()} disabled={anyLoading || !code.trim()} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md">
                 <Play className="mr-1 h-4 w-4" /> {isLexicalLoading ? 'Lexing...' : 'Lexical'}
               </Button>
               <Button onClick={() => handleAnalyzeSyntax()} disabled={anyLoading || !code.trim()} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md">
                  <Network className="mr-1 h-4 w-4" /> {isSyntaxLoading ? 'Parsing...' : 'Syntax'}
               </Button>
               <Button onClick={() => handleAnalyzeSemantics()} disabled={anyLoading || !code.trim()} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md">
                  <ScanSearch className="mr-1 h-4 w-4" /> {isSemanticsLoading ? 'Checking...' : 'Semantic'}
               </Button>
               <Button onClick={() => handleGenerateIntermediateCode()} disabled={anyLoading || !code.trim()} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md">
                  <Shuffle className="mr-1 h-4 w-4" /> {isIntermediateCodeLoading ? 'Gen IC...' : 'Gen IC'}
               </Button>
               <Button onClick={() => handleGenerateMachineCode()} disabled={anyLoading || !code.trim()} className="bg-gradient-to-r from-lime-500 to-green-500 text-white hover:from-lime-600 hover:to-green-600 shadow-md">
                  <Cpu className="mr-1 h-4 w-4" /> {isMachineCodeLoading ? 'Gen MC...' : 'Gen MC'}
               </Button>
               <Button onClick={handleReset} variant="outline" size="icon" disabled={anyLoading} className="border-destructive text-destructive hover:bg-destructive/10 shadow-sm">
                 <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Reset</span>
               </Button>
            </div>
          </div>
           <div className="flex-grow min-h-[30vh] md:min-h-[40vh] lg:min-h-0 border border-accent/50 rounded-md overflow-hidden shadow-inner">
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
        tac={tac} 
        machineCode={machineCode} 
        intermediateCode={intermediateCode} 
        syntaxAnalysis={syntaxAnalysis} 
        semanticAnalysis={semanticAnalysis} 
        isLoading={isLexicalLoading || isAllLoading} 
        isMachineCodeLoading={isMachineCodeLoading || isAllLoading}
        isIntermediateCodeLoading={isIntermediateCodeLoading || isAllLoading}
        isSyntaxLoading={isSyntaxLoading || isAllLoading}
        isSemanticsLoading={isSemanticsLoading || isAllLoading}
      />
    </div>
  );
}

