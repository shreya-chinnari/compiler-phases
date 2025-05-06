"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { List, TableProperties, BarChart3, TerminalSquare } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility

interface AnalysisResultsProps {
  tokens: Token[];
  symbolTable: SymbolTableEntry[];
  lexemeStats: LexemeStat[];
  tac: string[];
  isLoading: boolean;
}

// Updated TokenTypeBadge component using Tailwind JIT classes
const TokenTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  let bgColor = 'bg-gray-200'; // Default background
  let textColor = 'text-gray-800'; // Default text color

  switch (type) {
    case 'KEYWORD':
      bgColor = 'bg-[#AEC6CF]'; // Pastel Blue
      textColor = 'text-[#263238]' // Darker Blue-Gray text
      break;
    case 'IDENTIFIER':
      bgColor = 'bg-[#B0EACD]'; // Pastel Green
       textColor = 'text-[#1B5E20]' // Darker Green text
      break;
    case 'LITERAL_STRING':
      bgColor = 'bg-[#FFD1DC]'; // Pastel Pink
       textColor = 'text-[#880E4F]' // Darker Pink/Magenta text
      break;
    case 'LITERAL_NUMBER':
    case 'LITERAL_BOOLEAN':
    case 'LITERAL_CHAR':
      bgColor = 'bg-[#FFFFB3]'; // Pastel Yellow
       textColor = 'text-[#827717]' // Darker Yellow/Brown text
      break;
    case 'OPERATOR':
      bgColor = 'bg-[#FFB347]'; // Pastel Orange
       textColor = 'text-[#E65100]' // Darker Orange text
      break;
    case 'PUNCTUATION':
      bgColor = 'bg-[#B0EACD]'; // Pastel Green (reusing)
      textColor = 'text-[#1B5E20]' // Darker Green text
      break;
    case 'ERROR':
      bgColor = 'bg-destructive'; // Use theme's destructive color
      textColor = 'text-destructive-foreground';
      break;
    default:
      // Keep default colors for unknown types
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        bgColor,
        textColor,
        "border-transparent" // Ensure border is transparent unless needed
      )}
    >
      {type}
    </span>
  );
};


export function AnalysisResults({ tokens, symbolTable, lexemeStats, tac, isLoading }: AnalysisResultsProps) {

  const renderSkeletonTable = (cols: number, rows: number = 5) => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(cols)].map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            {[...Array(cols)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSkeletonList = (rows: number = 10) => (
    <div className="space-y-2 p-4">
       {[...Array(rows)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
    </div>
   );


  const hasContent = tokens.length > 0 || symbolTable.length > 0 || lexemeStats.length > 0 || tac.length > 0;

  return (
    <Card className="h-full flex flex-col border-accent shadow-lg"> {/* Added border and shadow */}
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg"> {/* Subtle gradient header */}
        <CardTitle className="text-lg font-semibold text-primary">Analysis Output</CardTitle> {/* Primary color title */}
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden bg-card"> {/* Ensure card bg */}
        <Tabs defaultValue="tokens" className="h-full flex flex-col">
          {/* Apply the colorful tab styles */}
           <TabsList className="tabs-list-colorful mx-4 mt-4 mb-2 shrink-0 grid grid-cols-4 gap-1 h-auto">
             <TabsTrigger value="tokens" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><List className='h-4 w-4'/> Tokens</TabsTrigger>
             <TabsTrigger value="symbolTable" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><TableProperties className='h-4 w-4'/> Symbol Table</TabsTrigger>
             <TabsTrigger value="stats" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><BarChart3 className='h-4 w-4'/> Lexeme Stats</TabsTrigger>
             <TabsTrigger value="tac" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><TerminalSquare className='h-4 w-4'/> TAC</TabsTrigger>
           </TabsList>

          <ScrollArea className="flex-grow px-4 pb-4">
            <TabsContent value="tokens" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : ( // Adjusted cols
                 tokens.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No tokens found.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Line</TableHead>
                      <TableHead className="w-[80px]">Token#</TableHead> {/* Added Token No. header */}
                      <TableHead>Token (Lexeme)</TableHead>
                      <TableHead>Token Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token, index) => (
                      <TableRow key={index} className="hover:bg-secondary/50"> {/* Subtle hover */}
                        <TableCell>{token.line}</TableCell>
                        <TableCell>{index + 1}</TableCell> {/* Display Token Number */}
                        <TableCell className="font-mono break-all">{token.token}</TableCell>
                        <TableCell><TokenTypeBadge type={token.type} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="symbolTable" className="mt-0">
               {isLoading ? renderSkeletonTable(5) : (
                 symbolTable.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">Symbol table is empty.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lexeme</TableHead>
                      <TableHead>Token Type</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Lines Defined/Used</TableHead>
                       {/* Add more headers if needed: Size, Attributes */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {symbolTable.map((entry, index) => (
                      <TableRow key={index} className="hover:bg-secondary/50">
                        <TableCell className="font-mono break-all">{entry.lexeme}</TableCell>
                        <TableCell><TokenTypeBadge type={entry.tokenType} /></TableCell>
                         <TableCell>{entry.dataType || <span className='text-muted-foreground text-xs italic'>unknown</span>}</TableCell> {/* More visible unknown */}
                        <TableCell className="text-xs">{entry.scope || 'N/A'}</TableCell> {/* Added fallback */}
                         <TableCell className="text-xs">{entry.lineNumbers.join(', ')}</TableCell>
                        {/* Display other attributes if available */}
                        {/* <TableCell>{entry.size ?? '-'}</TableCell> */}
                        {/* <TableCell>{JSON.stringify(entry.attributes) ?? '-'}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </TabsContent>

             <TabsContent value="stats" className="mt-0">
               {isLoading ? renderSkeletonTable(3) : (
                 lexemeStats.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No statistics available.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lexeme Type</TableHead>
                      <TableHead>Count</TableHead>
                       <TableHead>Frequency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lexemeStats.map((stat, index) => (
                      <TableRow key={index} className="hover:bg-secondary/50">
                        <TableCell><TokenTypeBadge type={stat.type} /></TableCell>
                        <TableCell>{stat.count}</TableCell>
                         <TableCell>{(stat.frequency * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
            </TabsContent>

             <TabsContent value="tac" className="mt-0">
              {isLoading ? renderSkeletonList() : (
                 tac.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No Three-Address Code generated.</p> :
                 // Apply gradient background and better text color for TAC
                <pre className="bg-gradient-to-br from-muted/50 to-secondary/30 p-4 rounded border border-accent/50 text-sm font-mono overflow-x-auto text-foreground/90 shadow-inner">
                    {tac.map((instruction, index) => (
                       // Add alternating row background for readability
                      <div key={index} className={cn("py-0.5", index % 2 === 0 ? "bg-transparent" : "bg-accent/10 rounded")}>
                          <span className='text-primary/80 mr-2'>{index + 1}:</span> {instruction}
                      </div>
                    ))}
                </pre>
               )}
            </TabsContent>

              { !isLoading && !hasContent && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                     <p>Enter code in the editor and click 'Analyze' to see the results.</p>
                </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
