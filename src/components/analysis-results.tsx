
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import type { GenerateIntermediateCodeOutput } from '@/ai/flows/generate-intermediate-code-flow';
import type { AnalyzeSyntaxOutput } from '@/ai/flows/analyze-syntax-flow';
import type { AnalyzeSemanticsOutput } from '@/ai/flows/analyze-semantics-flow';
import { Skeleton } from "@/components/ui/skeleton";
import { List, TableProperties, BarChart3, FileJson2, ScanSearch, Cpu, Shuffle, AlertTriangle, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  tokens: Token[];
  symbolTable: SymbolTableEntry[];
  lexemeStats: LexemeStat[];
  tac: string[];
  machineCode: string[];
  intermediateCode: GenerateIntermediateCodeOutput | null;
  syntaxAnalysis: AnalyzeSyntaxOutput | null;
  semanticAnalysis: AnalyzeSemanticsOutput | null;
  isLoading: boolean; // Combined loading for Lexical related or "Analyze All"
  isMachineCodeLoading: boolean; // Combined loading for MC or "Analyze All"
  isIntermediateCodeLoading: boolean; // Combined loading for IC or "Analyze All"
  isSyntaxLoading: boolean; // Combined loading for Syntax or "Analyze All"
  isSemanticsLoading: boolean; // Combined loading for Semantics or "Analyze All"
}

const TokenTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  let bgColor = 'bg-gray-200 dark:bg-gray-700';
  let textColor = 'text-gray-800 dark:text-gray-200';

  switch (type.toUpperCase()) {
    case 'KEYWORD':
      bgColor = 'bg-[#AEC6CF] dark:bg-[#5E7C88]'; textColor = 'text-[#263238] dark:text-[#E0F2F7]'; break;
    case 'IDENTIFIER':
      bgColor = 'bg-[#B0EACD] dark:bg-[#4CAF50]'; textColor = 'text-[#1B5E20] dark:text-[#E8F5E9]'; break;
    case 'LITERAL_STRING':
      bgColor = 'bg-[#FFD1DC] dark:bg-[#EC407A]'; textColor = 'text-[#880E4F] dark:text-[#FCE4EC]'; break;
    case 'LITERAL_NUMBER': case 'LITERAL_BOOLEAN': case 'LITERAL_CHAR':
      bgColor = 'bg-[#FFFFB3] dark:bg-[#FFEE58]'; textColor = 'text-[#827717] dark:text-[#FFFDE7]'; break;
    case 'OPERATOR':
      bgColor = 'bg-[#FFB347] dark:bg-[#FFA726]'; textColor = 'text-[#E65100] dark:text-[#FFF3E0]'; break;
    case 'PUNCTUATION':
      bgColor = 'bg-[#D1C4E9] dark:bg-[#7E57C2]'; textColor = 'text-[#311B92] dark:text-[#EDE7F6]'; break;
    case 'ERROR':
      bgColor = 'bg-destructive dark:bg-red-700'; textColor = 'text-destructive-foreground dark:text-red-100'; break;
    default: break;
  }

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none border-transparent", bgColor, textColor)}>
      {type}
    </span>
  );
};

const ResultListDisplay: React.FC<{ title?: string; items: string[] | undefined; isLoading: boolean; loadingMessage: string; emptyMessage: string; gradientFrom: string; gradientTo: string; borderColor: string; indexFormatter?: (index: number) => string; itemClassName?: string; hideTitle?: boolean; }> = ({
    title, items = [], isLoading, loadingMessage, emptyMessage, gradientFrom, gradientTo, borderColor, indexFormatter = (index) => (index + 1).toString(), itemClassName, hideTitle = false
}) => {
    if (isLoading) {
        return (
             <div className="space-y-2 p-4">
                {!hideTitle && title && <Skeleton className="h-4 w-1/4 mb-2" />}
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
             </div>
        );
    }
    if (items.length === 0) {
        return <p className="text-muted-foreground text-center py-4">{emptyMessage}</p>;
    }
    return (
        <div className="mt-0">
             {!hideTitle && title && <h4 className="text-sm font-semibold mb-1 text-primary/80">{title}</h4>}
             <pre className={cn("p-4 rounded border text-sm font-mono overflow-x-auto text-foreground/90 shadow-inner", `bg-gradient-to-br ${gradientFrom} ${gradientTo}`, borderColor)}>
                {items.map((item, index) => (
                    <div key={index} className={cn("py-0.5 whitespace-pre-wrap", index % 2 === 0 ? "bg-transparent" : "bg-black/5 dark:bg-white/5 rounded", itemClassName)}>
                        {indexFormatter(index) && <span className='text-primary/80 dark:text-primary/60 mr-2 font-semibold'>{indexFormatter(index)}:</span>} {item}
                    </div>
                ))}
            </pre>
        </div>
    );
};


export function AnalysisResults({
  tokens, symbolTable, lexemeStats, tac, machineCode, intermediateCode, syntaxAnalysis, semanticAnalysis,
  isLoading, isMachineCodeLoading, isIntermediateCodeLoading, isSyntaxLoading, isSemanticsLoading
}: AnalysisResultsProps) {

  const renderSkeletonTable = (cols: number, rows: number = 5) => (
    <Table>
      <TableHeader><TableRow>{[...Array(cols)].map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}</TableRow></TableHeader>
      <TableBody>{[...Array(rows)].map((_, i) => <TableRow key={i}>{[...Array(cols)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>)}</TableBody>
    </Table>
  );

  const renderSkeletonList = (rows: number = 10, showTitle: boolean = true) => (
    <div className="space-y-2 p-4">
        {showTitle && <Skeleton className="h-4 w-1/4 mb-2" />}
        {[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
    </div>
   );

  const hasLexerContent = tokens.length > 0 || symbolTable.length > 0 || lexemeStats.length > 0;
  const hasMachineCodeContent = machineCode.length > 0;
  const hasIntermediateCodeContent = tac.length > 0 || (intermediateCode !== null && (intermediateCode.quadruples.length > 0 || intermediateCode.triples.length > 0 || intermediateCode.indirectTriples.instructions.length > 0));
  const hasSyntaxContent = syntaxAnalysis !== null && ( (syntaxAnalysis.astRepresentation && syntaxAnalysis.astRepresentation.length > 0) || (syntaxAnalysis.syntaxErrors && syntaxAnalysis.syntaxErrors.length > 0) || (syntaxAnalysis.parseTree && syntaxAnalysis.parseTree.length > 0));
  const hasSemanticsContent = semanticAnalysis !== null && ( (semanticAnalysis.semanticErrors && semanticAnalysis.semanticErrors.length > 0) || (semanticAnalysis.warnings && semanticAnalysis.warnings.length > 0) );


  return (
    <Card className="h-full flex flex-col border-accent shadow-lg">
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
        <CardTitle className="text-lg font-semibold text-primary">Analysis Output</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden bg-card">
        <Tabs defaultValue="tokens" className="h-full flex flex-col">
           <div className="mx-4 mt-4 mb-2 shrink-0 overflow-x-auto">
             <TabsList className="tabs-list-colorful inline-flex w-auto min-w-full justify-start">
               {/* Lexical Analysis */}
               <TabsTrigger value="tokens" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><List className='h-4 w-4'/> Tokens</TabsTrigger>
               <TabsTrigger value="symbolTable" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><TableProperties className='h-4 w-4'/> Symbols</TabsTrigger>
               <TabsTrigger value="stats" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><BarChart3 className='h-4 w-4'/> Stats</TabsTrigger>
               {/* Syntax Analysis */}
               <TabsTrigger value="syntax" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><Network className='h-4 w-4'/> Syntax</TabsTrigger>
               {/* Semantic Analysis */}
               <TabsTrigger value="semantics" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><ScanSearch className='h-4 w-4'/> Semantics</TabsTrigger>
               {/* Intermediate Code */}
               <TabsTrigger value="intermediateCode" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><Shuffle className='h-4 w-4'/> IC</TabsTrigger>
               {/* Machine Code */}
               <TabsTrigger value="machineCode" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2 shrink-0"><Cpu className='h-4 w-4'/> MC</TabsTrigger>
             </TabsList>
           </div>

          <ScrollArea className="flex-grow px-4 pb-4">
            {/* Lexical Analysis Tabs */}
            <TabsContent value="tokens" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : (
                 tokens.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No tokens found.</p> :
                <Table>
                  <TableHeader><TableRow><TableHead className="w-[80px]">Line</TableHead><TableHead className="w-[80px]">Token#</TableHead><TableHead>Token (Lexeme)</TableHead><TableHead>Token Type</TableHead></TableRow></TableHeader>
                  <TableBody>{tokens.map((token, index) => (<TableRow key={index} className="hover:bg-secondary/50"><TableCell>{token.line}</TableCell><TableCell>{index + 1}</TableCell><TableCell className="font-mono break-all">{token.token}</TableCell><TableCell><TokenTypeBadge type={token.type} /></TableCell></TableRow>))}</TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="symbolTable" className="mt-0">
               {isLoading ? renderSkeletonTable(5) : (
                 symbolTable.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">Symbol table is empty.</p> :
                <Table>
                  <TableHeader><TableRow><TableHead>Lexeme</TableHead><TableHead>Token Type</TableHead><TableHead>Data Type</TableHead><TableHead>Scope</TableHead><TableHead>Lines</TableHead></TableRow></TableHeader>
                  <TableBody>{symbolTable.map((entry, index) => (<TableRow key={index} className="hover:bg-secondary/50"><TableCell className="font-mono break-all">{entry.lexeme}</TableCell><TableCell><TokenTypeBadge type={entry.tokenType} /></TableCell><TableCell>{entry.dataType || <span className='text-muted-foreground text-xs italic'>unknown</span>}</TableCell><TableCell className="text-xs">{entry.scope || 'N/A'}</TableCell><TableCell className="text-xs">{entry.lineNumbers.join(', ')}</TableCell></TableRow>))}</TableBody>
                </Table>
               )}
            </TabsContent>

             <TabsContent value="stats" className="mt-0">
               {isLoading ? renderSkeletonTable(3) : (
                 lexemeStats.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No statistics available.</p> :
                <Table>
                  <TableHeader><TableRow><TableHead>Lexeme Type</TableHead><TableHead>Count</TableHead><TableHead>Frequency</TableHead></TableRow></TableHeader>
                  <TableBody>{lexemeStats.map((stat, index) => (<TableRow key={index} className="hover:bg-secondary/50"><TableCell><TokenTypeBadge type={stat.type} /></TableCell><TableCell>{stat.count}</TableCell><TableCell>{(stat.frequency * 100).toFixed(2)}%</TableCell></TableRow>))}</TableBody>
                </Table>
                )}
            </TabsContent>

            {/* Syntax Analysis Combined Tab */}
            <TabsContent value="syntax" className="mt-0">
                {isSyntaxLoading ? renderSkeletonList(10, false) : (
                    syntaxAnalysis ? (
                        <>
                            {syntaxAnalysis.syntaxErrors && syntaxAnalysis.syntaxErrors.length > 0 ? (
                                <ResultListDisplay title="Syntax Errors" items={syntaxAnalysis.syntaxErrors} isLoading={false} loadingMessage="" emptyMessage="No syntax errors reported." gradientFrom="from-red-100 dark:from-red-900/30" gradientTo="to-pink-100 dark:to-pink-900/30" borderColor="border-red-300 dark:border-red-700" indexFormatter={(idx) => `Err ${idx+1}`} itemClassName="text-destructive dark:text-red-400" />
                            ) : (
                                <>
                                  <ResultListDisplay title="Parse Tree (Simplified)" items={syntaxAnalysis.parseTree} isLoading={false} loadingMessage="" emptyMessage="No Parse Tree generated." gradientFrom="from-purple-100 dark:from-purple-900/30" gradientTo="to-pink-100 dark:to-pink-900/30" borderColor="border-purple-300 dark:border-purple-700" indexFormatter={() => ''} itemClassName="text-left" />
                                  <div className='my-4'>
                                     <ResultListDisplay title="Abstract Syntax Tree (Simplified)" items={syntaxAnalysis.astRepresentation} isLoading={false} loadingMessage="" emptyMessage="No AST generated." gradientFrom="from-sky-100 dark:from-sky-900/30" gradientTo="to-indigo-100 dark:to-indigo-900/30" borderColor="border-sky-300 dark:border-sky-700" indexFormatter={() => ''} itemClassName="text-left" />
                                  </div>
                                </>
                            )}
                            <p className="text-xs text-muted-foreground mt-2 px-1">{syntaxAnalysis.parseStatus}</p>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Perform Syntax Analysis to see results.</p>
                    )
                )}
            </TabsContent>


            {/* Semantic Analysis Tab */}
             <TabsContent value="semantics" className="mt-0">
                 {isSemanticsLoading ? renderSkeletonList(10, false) : (
                     semanticAnalysis ? (
                         <>
                             <ResultListDisplay title="Semantic Errors" items={semanticAnalysis.semanticErrors} isLoading={false} loadingMessage="" emptyMessage="No semantic errors reported." gradientFrom="from-orange-100 dark:from-orange-900/30" gradientTo="to-amber-100 dark:to-amber-900/30" borderColor="border-orange-300 dark:border-orange-700" indexFormatter={(idx) => `Error ${idx+1}`} itemClassName="text-amber-700 dark:text-amber-400" />
                             <div className="my-4">
                               <ResultListDisplay title="Semantic Warnings" items={semanticAnalysis.warnings} isLoading={false} loadingMessage="" emptyMessage="No semantic warnings." gradientFrom="from-yellow-100 dark:from-yellow-900/30" gradientTo="to-lime-100 dark:to-lime-900/30" borderColor="border-yellow-300 dark:border-yellow-700" indexFormatter={(idx) => `Warn ${idx+1}`} itemClassName="text-yellow-700 dark:text-yellow-400" />
                             </div>
                             <p className="text-xs text-muted-foreground mt-2 px-1">{semanticAnalysis.analysisSummary}</p>
                         </>
                     ) : <p className="text-muted-foreground text-center py-8">Perform Semantic Analysis to see results.</p>
                 )}
             </TabsContent>

            {/* Intermediate Code Combined Tab */}
            <TabsContent value="intermediateCode" className="mt-0 space-y-4">
                {isLoading || isIntermediateCodeLoading ? renderSkeletonList(15, false) : (
                    hasIntermediateCodeContent ? (
                        <>
                             <ResultListDisplay title="Three-Address Code (Lexer)" items={tac} isLoading={isLoading} loadingMessage="" emptyMessage="No TAC generated by lexer." gradientFrom="from-muted/50 dark:from-muted/20" gradientTo="to-secondary/30 dark:to-secondary/10" borderColor="border-accent/50 dark:border-accent/30" hideTitle={isLoading}/>
                             <ResultListDisplay title="Quadruples (AI)" items={intermediateCode?.quadruples} isLoading={isIntermediateCodeLoading} loadingMessage="" emptyMessage="No Quadruples generated by AI." gradientFrom="from-blue-100 dark:from-blue-900/30" gradientTo="to-purple-100 dark:to-purple-900/30" borderColor="border-blue-300 dark:border-blue-700" indexFormatter={(index) => `${index}`} hideTitle={isIntermediateCodeLoading}/>
                             <ResultListDisplay title="Triples (AI)" items={intermediateCode?.triples} isLoading={isIntermediateCodeLoading} loadingMessage="" emptyMessage="No Triples generated by AI." gradientFrom="from-green-100 dark:from-green-900/30" gradientTo="to-teal-100 dark:to-teal-900/30" borderColor="border-green-300 dark:border-green-700" indexFormatter={() => ``} hideTitle={isIntermediateCodeLoading}/>
                             {intermediateCode?.indirectTriples && (intermediateCode.indirectTriples.instructions.length > 0 || intermediateCode.indirectTriples.triplesTable.length > 0) && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <ResultListDisplay title="Indirect Triples - Instructions (AI)" items={intermediateCode.indirectTriples.instructions} isLoading={isIntermediateCodeLoading} loadingMessage="" emptyMessage="No instructions." gradientFrom="from-yellow-100 dark:from-yellow-900/30" gradientTo="to-orange-100 dark:to-orange-900/30" borderColor="border-yellow-300 dark:border-yellow-700" indexFormatter={(index) => `${index}`} hideTitle={isIntermediateCodeLoading}/>
                                     <ResultListDisplay title="Indirect Triples - Triples Table (AI)" items={intermediateCode.indirectTriples.triplesTable} isLoading={isIntermediateCodeLoading} loadingMessage="" emptyMessage="Triples table empty." gradientFrom="from-pink-100 dark:from-pink-900/30" gradientTo="to-red-100 dark:to-red-900/30" borderColor="border-pink-300 dark:border-pink-700" indexFormatter={() => ``} hideTitle={isIntermediateCodeLoading}/>
                                 </div>
                            )}
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Perform Lexical Analysis or Generate IC to see results.</p>
                    )
                )}
            </TabsContent>

             <TabsContent value="machineCode" className="mt-0">
                <ResultListDisplay title="Machine Code (AI)" items={machineCode} isLoading={isMachineCodeLoading} loadingMessage="Generating MC..." emptyMessage="Generate MC to see Machine Code." gradientFrom="from-muted/60 dark:from-muted/30" gradientTo="to-primary/20 dark:to-primary/10" borderColor="border-primary/50 dark:border-primary/30" indexFormatter={(index) => index.toString(16).padStart(4, '0')} hideTitle={isMachineCodeLoading}/>
            </TabsContent>

            { !isLoading && !isMachineCodeLoading && !isIntermediateCodeLoading && !isSyntaxLoading && !isSemanticsLoading && !hasLexerContent && !hasMachineCodeContent && !hasIntermediateCodeContent && !hasSyntaxContent && !hasSemanticsContent && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                     <p>Enter code and click an analysis/generation button.</p>
                </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

