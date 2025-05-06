"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, List, TableProperties, BarChart3 } from 'lucide-react';


interface AnalysisResultsProps {
  tokens: Token[];
  errors: Token[];
  symbolTable: SymbolTableEntry[];
  lexemeStats: LexemeStat[];
  isLoading: boolean;
}

const TokenTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  switch (type) {
    case 'KEYWORD': variant = 'default'; break;
    case 'IDENTIFIER': variant = 'secondary'; break;
    case 'LITERAL_STRING': variant = 'outline'; break;
    case 'LITERAL_NUMBER': variant = 'outline'; break;
    case 'LITERAL_BOOLEAN': variant = 'outline'; break;
    case 'LITERAL_CHAR': variant = 'outline'; break;
    case 'OPERATOR': variant = 'outline'; break;
    case 'PUNCTUATION': variant = 'secondary'; break;
    case 'COMMENT_SINGLE': variant = 'secondary'; break;
    case 'COMMENT_MULTI': variant = 'secondary'; break;
    case 'ERROR': variant = 'destructive'; break;
    default: variant = 'secondary'; // Default for potentially new types
  }
  return <Badge variant={variant}>{type}</Badge>;
};


export function AnalysisResults({ tokens, errors, symbolTable, lexemeStats, isLoading }: AnalysisResultsProps) {

  const renderSkeletonTable = (cols: number) => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(cols)].map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            {[...Array(cols)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const hasContent = tokens.length > 0 || errors.length > 0 || symbolTable.length > 0 || lexemeStats.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg">Analysis Output</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <Tabs defaultValue="tokens" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-0 mb-2 shrink-0">
            <TabsTrigger value="tokens" className="flex items-center gap-1"><List className='h-4 w-4'/> Tokens <Badge variant="secondary" className="ml-1">{isLoading ? '...' : tokens.length}</Badge></TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-1"><AlertCircle className='h-4 w-4 text-destructive'/> Errors <Badge variant={errors.length > 0 ? "destructive" : "secondary"} className="ml-1">{isLoading ? '...' : errors.length}</Badge></TabsTrigger>
            <TabsTrigger value="symbolTable" className="flex items-center gap-1"><TableProperties className='h-4 w-4'/> Symbol Table <Badge variant="secondary" className="ml-1">{isLoading ? '...' : symbolTable.length}</Badge></TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1"><BarChart3 className='h-4 w-4'/> Lexeme Stats</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow px-4 pb-4">
            <TabsContent value="tokens" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : ( // Updated skeleton cols to 4
                 tokens.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No tokens found.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Line No.</TableHead>
                      <TableHead className="w-[80px]">Token No.</TableHead>
                      <TableHead>Token (lexeme)</TableHead>
                      <TableHead>Token Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token, index) => (
                      <TableRow key={index}>
                        <TableCell>{token.line}</TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{token.token}</TableCell>
                        <TableCell><TokenTypeBadge type={token.type} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="errors" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : ( // Updated skeleton cols to 4
                 errors.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No errors detected.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error Token</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Line</TableHead>
                      <TableHead>Column</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.map((error, index) => (
                      <TableRow key={index} className="text-destructive">
                        <TableCell className="font-mono">{error.token}</TableCell>
                        <TableCell>{error.message || 'Invalid token'}</TableCell>
                        <TableCell>{error.line}</TableCell>
                         <TableCell>{error.column}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="symbolTable" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : ( // Updated skeleton cols to 4
                 symbolTable.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">Symbol table is empty.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Identifier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scope</TableHead>
                       <TableHead>Line Defined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {symbolTable.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{entry.identifier}</TableCell>
                        <TableCell>{entry.type || 'unknown'}</TableCell>
                        <TableCell>{entry.scope || 'global'}</TableCell>
                         <TableCell>{entry.lineDefined}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
               {isLoading ? renderSkeletonTable(3) : ( // Kept skeleton cols at 3
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
