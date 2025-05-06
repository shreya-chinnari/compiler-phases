"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Token, SymbolTableEntry, LexemeStat } from '@/lib/types';
import type { GenerateIntermediateCodeOutput } from '@/ai/flows/generate-intermediate-code-flow'; // Import IC types
import { Skeleton } from "@/components/ui/skeleton";
import { List, TableProperties, BarChart3, TerminalSquare, Cpu, Braces, Binary } from 'lucide-react'; // Added Braces, Binary
import { cn } from '@/lib/utils'; // Import cn utility

interface AnalysisResultsProps {
  tokens: Token[];
  symbolTable: SymbolTableEntry[];
  lexemeStats: LexemeStat[];
  tac: string[];
  machineCode: string[];
  intermediateCode: GenerateIntermediateCodeOutput | null; // Add IC prop
  isLoading: boolean;
  isMachineCodeLoading: boolean;
  isIntermediateCodeLoading: boolean; // Add IC loading state
}

// Updated TokenTypeBadge component using Tailwind JIT classes
const TokenTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  let bgColor = 'bg-gray-200'; // Default background
  let textColor = 'text-gray-800'; // Default text color

  switch (type) {
    case 'KEYWORD':
      bgColor = 'bg-[#AEC6CF]'; // Pastel Blue
      textColor = 'text-[#263238]'; // Darker Blue-Gray text
      break;
    case 'IDENTIFIER':
      bgColor = 'bg-[#B0EACD]'; // Pastel Green
      textColor = 'text-[#1B5E20]'; // Darker Green text
      break;
    case 'LITERAL_STRING':
      bgColor = 'bg-[#FFD1DC]'; // Pastel Pink
      textColor = 'text-[#880E4F]'; // Darker Pink/Magenta text
      break;
    case 'LITERAL_NUMBER':
    case 'LITERAL_BOOLEAN':
    case 'LITERAL_CHAR':
      bgColor = 'bg-[#FFFFB3]'; // Pastel Yellow
      textColor = 'text-[#827717]'; // Darker Yellow/Brown text
      break;
    case 'OPERATOR':
      bgColor = 'bg-[#FFB347]'; // Pastel Orange
      textColor = 'text-[#E65100]'; // Darker Orange text
      break;
    case 'PUNCTUATION':
      bgColor = 'bg-[#B0EACD]'; // Pastel Green (reusing)
      textColor = 'text-[#1B5E20]'; // Darker Green text
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

// Component to render list-based results (like TAC, MC, IC)
const ResultListDisplay: React.FC<{ title: string; items: string[]; isLoading: boolean; loadingMessage: string; emptyMessage: string; gradientFrom: string; gradientTo: string; borderColor: string; indexFormatter?: (index: number) => string }> = ({
    title,
    items,
    isLoading,
    loadingMessage,
    emptyMessage,
    gradientFrom,
    gradientTo,
    borderColor,
    indexFormatter = (index) => (index + 1).toString() // Default index formatter
}) => {
    if (isLoading) {
        return (
             <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/4" />
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
             </div>
        );
    }
    if (items.length === 0) {
        return <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>;
    }
    return (
        <div className="mt-0">
            {/* <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3> */}
             <pre className={cn("p-4 rounded border text-sm font-mono overflow-x-auto text-foreground/90 shadow-inner", `bg-gradient-to-br ${gradientFrom} ${gradientTo}`, borderColor)}>
                {items.map((instruction, index) => (
                    <div key={index} className={cn("py-0.5", index % 2 === 0 ? "bg-transparent" : "bg-black/5 dark:bg-white/5 rounded")}>
                        <span className='text-primary/80 dark:text-primary/60 mr-2'>{indexFormatter(index)}:</span> {instruction}
                    </div>
                ))}
            </pre>
        </div>
    );
};


export function AnalysisResults({
  tokens,
  symbolTable,
  lexemeStats,
  tac,
  machineCode,
  intermediateCode, // Add intermediateCode prop
  isLoading,
  isMachineCodeLoading,
  isIntermediateCodeLoading // Add isIntermediateCodeLoading prop
}: AnalysisResultsProps) {

  // Ensure no whitespace nodes are rendered within TableRow
  const renderSkeletonTable = (cols: number, rows: number = 5) => (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(cols)].map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i}>
            {[...Array(cols)].map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
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


  const hasLexerContent = tokens.length > 0 || symbolTable.length > 0 || lexemeStats.length > 0 || tac.length > 0;
  const hasMachineCodeContent = machineCode.length > 0;
  const hasIntermediateCodeContent = intermediateCode !== null && (
    intermediateCode.quadruples.length > 0 ||
    intermediateCode.triples.length > 0 ||
    intermediateCode.indirectTriples.instructions.length > 0
  );

  return (
    <Card className="h-full flex flex-col border-accent shadow-lg"> {/* Added border and shadow */}
      <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg"> {/* Subtle gradient header */}
        <CardTitle className="text-lg font-semibold text-primary">Analysis Output</CardTitle> {/* Primary color title */}
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden bg-card"> {/* Ensure card bg */}
        <Tabs defaultValue="tokens" className="h-full flex flex-col">
          {/* Apply the colorful tab styles */}
           {/* Adjust grid columns based on number of tabs */}
           <TabsList className="tabs-list-colorful mx-4 mt-4 mb-2 shrink-0 grid grid-cols-4 md:grid-cols-8 gap-1 h-auto">
             <TabsTrigger value="tokens" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><List className='h-4 w-4'/> Tokens</TabsTrigger>
             <TabsTrigger value="symbolTable" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><TableProperties className='h-4 w-4'/> Symbol Table</TabsTrigger>
             <TabsTrigger value="stats" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><BarChart3 className='h-4 w-4'/> Lexeme Stats</TabsTrigger>
             <TabsTrigger value="tac" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><TerminalSquare className='h-4 w-4'/> TAC</TabsTrigger>
             <TabsTrigger value="quadruples" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><Braces className='h-4 w-4'/> Quads</TabsTrigger> {/* IC Quadruples */}
             <TabsTrigger value="triples" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><Binary className='h-4 w-4'/> Triples</TabsTrigger> {/* IC Triples */}
             <TabsTrigger value="indirectTriples" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><Binary className='h-4 w-4'/> Indirect</TabsTrigger> {/* IC Indirect Triples */}
             <TabsTrigger value="machineCode" className="tabs-trigger-colorful flex items-center gap-1 text-xs sm:text-sm px-2"><Cpu className='h-4 w-4'/> Machine Code</TabsTrigger>
           </TabsList>

          <ScrollArea className="flex-grow px-4 pb-4">
            {/* Lexer Tabs */}
            <TabsContent value="tokens" className="mt-0">
              {isLoading ? renderSkeletonTable(4) : (
                 tokens.length === 0 && !isLoading ? <p className="text-muted-foreground text-center py-8">No tokens found.</p> :
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Line</TableHead>
                      <TableHead className="w-[80px]">Token#</TableHead>
                      <TableHead>Token (Lexeme)</TableHead>
                      <TableHead>Token Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token, index) => (
                      <TableRow key={index} className="hover:bg-secondary/50">
                        <TableCell>{token.line}</TableCell>
                        <TableCell>{index + 1}</TableCell>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {symbolTable.map((entry, index) => (
                      <TableRow key={index} className="hover:bg-secondary/50">
                        <TableCell className="font-mono break-all">{entry.lexeme}</TableCell>
                        <TableCell><TokenTypeBadge type={entry.tokenType} /></TableCell>
                         <TableCell>{entry.dataType || <span className='text-muted-foreground text-xs italic'>unknown</span>}</TableCell>
                        <TableCell className="text-xs">{entry.scope || 'N/A'}</TableCell>
                         <TableCell className="text-xs">{entry.lineNumbers.join(', ')}</TableCell>
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
                <ResultListDisplay
                    title="Three-Address Code"
                    items={tac}
                    isLoading={isLoading}
                    loadingMessage="Analyzing code for TAC..."
                    emptyMessage="No Three-Address Code generated."
                    gradientFrom="from-muted/50"
                    gradientTo="to-secondary/30"
                    borderColor="border-accent/50"
                />
            </TabsContent>

            {/* Intermediate Code Tabs */}
            <TabsContent value="quadruples" className="mt-0">
                <ResultListDisplay
                    title="Quadruples"
                    items={intermediateCode?.quadruples ?? []}
                    isLoading={isIntermediateCodeLoading}
                    loadingMessage="Generating Quadruples..."
                    emptyMessage="Generate Intermediate Code to see Quadruples."
                    gradientFrom="from-blue-100" // Example colors
                    gradientTo="to-purple-100"
                    borderColor="border-blue-300"
                    indexFormatter={(index) => `${index}`} // Quad index starts at 0 usually
                />
            </TabsContent>

            <TabsContent value="triples" className="mt-0">
                <ResultListDisplay
                    title="Triples"
                    items={intermediateCode?.triples ?? []}
                    isLoading={isIntermediateCodeLoading}
                    loadingMessage="Generating Triples..."
                    emptyMessage="Generate Intermediate Code to see Triples."
                    gradientFrom="from-green-100"
                    gradientTo="to-teal-100"
                    borderColor="border-green-300"
                     // Index format is often embedded: (0: ...)
                    indexFormatter={(index) => ``} // Remove default index
                />
             </TabsContent>

             <TabsContent value="indirectTriples" className="mt-0">
                 {isIntermediateCodeLoading ? renderSkeletonList(15) : (
                     intermediateCode?.indirectTriples && (intermediateCode.indirectTriples.instructions.length > 0 || intermediateCode.indirectTriples.triplesTable.length > 0) ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <ResultListDisplay
                                 title="Indirect Triples - Instructions"
                                 items={intermediateCode.indirectTriples.instructions}
                                 isLoading={false} // Already handled above
                                 loadingMessage=""
                                 emptyMessage="No instructions."
                                 gradientFrom="from-yellow-100"
                                 gradientTo="to-orange-100"
                                 borderColor="border-yellow-300"
                                 indexFormatter={(index) => `${index}`} // Instruction index
                             />
                             <ResultListDisplay
                                 title="Indirect Triples - Triples Table"
                                 items={intermediateCode.indirectTriples.triplesTable}
                                 isLoading={false} // Already handled above
                                 loadingMessage=""
                                 emptyMessage="Triples table is empty."
                                 gradientFrom="from-pink-100"
                                 gradientTo="to-red-100"
                                 borderColor="border-pink-300"
                                 // Index format is often embedded: (0: ...)
                                indexFormatter={(index) => ``} // Remove default index
                             />
                         </div>
                     ) : (
                         <p className="text-muted-foreground text-center py-8">Generate Intermediate Code to see Indirect Triples.</p>
                     )
                 )}
             </TabsContent>


             {/* Machine Code Tab */}
             <TabsContent value="machineCode" className="mt-0">
                <ResultListDisplay
                    title="Machine Code"
                    items={machineCode}
                    isLoading={isMachineCodeLoading}
                    loadingMessage="Generating Machine Code..."
                    emptyMessage="Generate Machine Code to see the output."
                    gradientFrom="from-muted/60"
                    gradientTo="to-primary/20"
                    borderColor="border-primary/50"
                    indexFormatter={(index) => index.toString(16).padStart(4, '0')} // Hex index for MC
                />
            </TabsContent>

            {/* Fallback Message */}
            { !isLoading && !isMachineCodeLoading && !isIntermediateCodeLoading && !hasLexerContent && !hasMachineCodeContent && !hasIntermediateCodeContent && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                     <p>Enter code in the editor and click 'Analyze', 'Generate IC', or 'Generate MC' to see the results.</p>
                </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
