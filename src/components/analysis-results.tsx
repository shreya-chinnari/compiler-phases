"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { List, TableProperties, BarChart3, TerminalSquare } from 'lucide-react'; // Added TerminalSquare for TAC


interface AnalysisResultsProps {
  tokens: Token[];
  symbolTable: SymbolTableEntry[];
  lexemeStats: LexemeStat[];
  tac: string[]; // Added TAC prop
  isLoading: boolean;
}

const TokenTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  // Map token types to badge variants for better visual distinction
  switch (type) {
    case 'KEYWORD': variant = 'default'; break; // Primary color for keywords
    case 'IDENTIFIER': variant = 'secondary'; break; // Secondary for identifiers
    case 'LITERAL_STRING':
    case 'LITERAL_NUMBER':
    case 'LITERAL_BOOLEAN':
    case 'LITERAL_CHAR': variant = 'outline'; break; // Outline for literals
    case 'OPERATOR': variant = 'destructive'; break; // Destructive (or another distinct color) for operators
    case 'PUNCTUATION': variant = 'secondary'; break; // Secondary for punctuation
    case 'ERROR': variant = 'destructive'; break; // Destructive for errors
    default: variant = 'secondary'; // Default for any unexpected types
  }
  return <Badge variant={variant}>{type}</Badge>;
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg">Analysis Output</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <Tabs defaultValue="tokens" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-0 mb-2 shrink-0 grid grid-cols-4 gap-1 h-auto">
            <TabsTrigger value="tokens" className="flex items-center gap-1 text-xs sm:text-sm px-2"><List className='h-4 w-4'/> Tokens <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">{isLoading ? '...' : tokens.length}</Badge></TabsTrigger>
            <TabsTrigger value="symbolTable" className="flex items-center gap-1 text-xs sm:text-sm px-2"><TableProperties className='h-4 w-4'/> Symbol Table <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">{isLoading ? '...' : symbolTable.length}</Badge></TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 text-xs sm:text-sm px-2"><BarChart3 className='h-4 w-4'/> Lexeme Stats</TabsTrigger>
            <TabsTrigger value="tac" className="flex items-center gap-1 text-xs sm:text-sm px-2"><TerminalSquare className='h-4 w-4'/> TAC <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">{isLoading ? '...' : tac.length}</Badge></TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow px-4 pb-4">
            <TabsContent value="tokens" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : (
                 tokens.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No tokens found.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Line</TableHead>
                      <TableHead className="w-[80px]">Column</TableHead>
                      <TableHead>Lexeme</TableHead>
                      <TableHead>Token Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token, index) => (
                      <TableRow key={index}>
                        <TableCell>{token.line}</TableCell>
                        <TableCell>{token.column}</TableCell>
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
                      <TableRow key={index}>
                        <TableCell className="font-mono break-all">{entry.lexeme}</TableCell>
                        <TableCell><TokenTypeBadge type={entry.tokenType} /></TableCell>
                        <TableCell>{entry.dataType || 'unknown'}</TableCell>
                        <TableCell className="text-xs">{entry.scope}</TableCell>
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
                      <TableRow key={index}>
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
                <pre className="bg-muted p-4 rounded border text-sm font-mono overflow-x-auto">
                    {tac.map((instruction, index) => (
                      <div key={index}>{instruction}</div>
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
