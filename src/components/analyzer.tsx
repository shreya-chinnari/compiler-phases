
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
import { Play, Trash2, FileCode, Cpu, Braces, ScanSearch, FileJson2 } from 'lucide-react'; // Added ScanSearch, FileJson2
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMachineCodeLoading, setIsMachineCodeLoading] = useState<boolean>(false);
  const [isIntermediateCodeLoading, setIsIntermediateCodeLoading] = useState<boolean>(false);
  const [isSyntaxLoading, setIsSyntaxLoading] = useState<boolean>(false);
  const [isSemanticsLoading, setIsSemanticsLoading] = useState<boolean>(false);

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
  }, [language]);

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
    setTac([]);

    try {
       await new Promise(resolve => setTimeout(resolve, 500));
      const { tokens, symbolTable, lexemeStats, tac } = analyzeCode(code, language);
      setTokens(tokens);
      setSymbolTable(symbolTable);
      setLexemeStats(lexemeStats);
      setTac(tac);
      toast({
        title: "Lexical Analysis Complete",
        description: `Found ${tokens.length} tokens. Check results below.`,
      });
    } catch (error) {
      console.error("Lexical analysis error:", error);
       toast({
         title: "Lexical Analysis Failed",
         description: `An unexpected error occurred. ${error instanceof Error ? error.message : 'Check console.'}`,
         variant: "destructive",
       });
        setTokens([]);
        setSymbolTable([]);
        setLexemeStats([]);
        setTac([]);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, toast]);

  const handleGenerateMachineCode = useCallback(async () => {
      if (!code.trim()) {
         toast({ title: "Input Required", description: "Please enter code.", variant: "destructive" });
        return;
      }
      setIsMachineCodeLoading(true);
      setMachineCode([]);
      try {
        const result = await generateMachineCode({ code, language });
        setMachineCode(result.machineCode);
        toast({ title: "Machine Code Generated", description: `Successfully generated instructions.` });
      } catch (error) {
        console.error("Machine code generation error:", error);
         toast({ title: "MC Generation Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
         setMachineCode([]);
      } finally {
        setIsMachineCodeLoading(false);
      }
    }, [code, language, toast]);

   const handleGenerateIntermediateCode = useCallback(async () => {
       if (!code.trim()) {
          toast({ title: "Input Required", description: "Please enter code.", variant: "destructive" });
         return;
       }
       setIsIntermediateCodeLoading(true);
       setIntermediateCode(null);
       try {
         const result = await generateIntermediateCode({ code, language });
         setIntermediateCode(result);
         toast({ title: "Intermediate Code Generated", description: `Successfully generated IC representations.` });
       } catch (error) {
         console.error("Intermediate code generation error:", error);
          toast({ title: "IC Generation Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
          setIntermediateCode(null);
       } finally {
         setIsIntermediateCodeLoading(false);
       }
     }, [code, language, toast]);

  const handleAnalyzeSyntax = useCallback(async () => {
    if (!code.trim()) {
      toast({ title: "Input Required", description: "Please enter code for syntax analysis.", variant: "destructive" });
      return;
    }
    setIsSyntaxLoading(true);
    setSyntaxAnalysis(null);
    try {
      const result = await analyzeSyntax({ code, language });
      setSyntaxAnalysis(result);
      toast({ title: "Syntax Analysis Complete", description: result.parseStatus });
    } catch (error) {
      console.error("Syntax analysis error:", error);
      toast({ title: "Syntax Analysis Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
      setSyntaxAnalysis(null);
    } finally {
      setIsSyntaxLoading(false);
    }
  }, [code, language, toast]);

  const handleAnalyzeSemantics = useCallback(async () => {
    if (!code.trim()) {
      toast({ title: "Input Required", description: "Please enter code for semantic analysis.", variant: "destructive" });
      return;
    }
    setIsSemanticsLoading(true);
    setSemanticAnalysis(null);
    try {
      const result = await analyzeSemantics({ code, language });
      setSemanticAnalysis(result);
      toast({ title: "Semantic Analysis Complete", description: result.analysisSummary });
    } catch (error) {
      console.error("Semantic analysis error:", error);
      toast({ title: "Semantic Analysis Failed", description: `${error instanceof Error ? error.message : 'Check console.'}`, variant: "destructive" });
      setSemanticAnalysis(null);
    } finally {
      setIsSemanticsLoading(false);
    }
  }, [code, language, toast]);


  const handleReset = useCallback(() => {
    setCode('');
    setTokens([]);
    setSymbolTable([]);
    setLexemeStats([]);
    setTac([]);
    setMachineCode([]);
    setIntermediateCode(null);
    setSyntaxAnalysis(null);
    setSemanticAnalysis(null);
    toast({ title: "Reset Complete", description: "Editor and results cleared." });
  }, [toast]);

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
     toast({ title: "Language Changed", description: `Switched to ${newLang.toUpperCase()}. Sample loaded.` });
  };

  const anyLoading = isLoading || isMachineCodeLoading || isIntermediateCodeLoading || isSyntaxLoading || isSemanticsLoading;

  if (!isClient) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-theme(spacing.24))]">
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
               <Button onClick={handleAnalyze} disabled={anyLoading || !code.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <Play className="mr-1 h-4 w-4" /> {isLoading ? 'Lexing...' : 'Lexical'}
               </Button>
               <Button onClick={handleAnalyzeSyntax} disabled={anyLoading || !code.trim()} className="bg-teal-500 hover:bg-teal-500/90 text-white">
                  <FileJson2 className="mr-1 h-4 w-4" /> {isSyntaxLoading ? 'Parsing...' : 'Syntax'}
               </Button>
               <Button onClick={handleAnalyzeSemantics} disabled={anyLoading || !code.trim()} className="bg-purple-500 hover:bg-purple-500/90 text-white">
                  <ScanSearch className="mr-1 h-4 w-4" /> {isSemanticsLoading ? 'Checking...' : 'Semantic'}
               </Button>
               <Button onClick={handleGenerateIntermediateCode} disabled={anyLoading || !code.trim()} className="bg-[#FF69B4] hover:bg-[#FF69B4]/90 text-white">
                  <Braces className="mr-1 h-4 w-4" /> {isIntermediateCodeLoading ? 'Gen IC...' : 'Gen IC'}
               </Button>
               <Button onClick={handleGenerateMachineCode} disabled={anyLoading || !code.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Cpu className="mr-1 h-4 w-4" /> {isMachineCodeLoading ? 'Gen MC...' : 'Gen MC'}
               </Button>
               <Button onClick={handleReset} variant="outline" size="icon" disabled={anyLoading} className="border-destructive text-destructive hover:bg-destructive/10">
                 <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Reset</span>
               </Button>
            </div>
          </div>
           <div className="flex-grow min-h-[40vh] lg:min-h-0 border border-accent/50 rounded-md overflow-hidden shadow-inner">
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
        isLoading={isLoading}
        isMachineCodeLoading={isMachineCodeLoading}
        isIntermediateCodeLoading={isIntermediateCodeLoading}
        isSyntaxLoading={isSyntaxLoading}
        isSemanticsLoading={isSemanticsLoading}
      />
    </div>
  );
}
