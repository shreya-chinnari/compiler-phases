
'use server';
/**
 * @fileOverview Analyzes the syntax of Java or C++ source code, generating a Parse Tree, an AST representation, or listing syntax errors.
 *
 * - analyzeSyntax - A function that calls the Genkit flow to perform syntax analysis.
 * - AnalyzeSyntaxInput - The input type for the analyzeSyntax function.
 * - AnalyzeSyntaxOutput - The return type for the analyzeSyntax function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Input Schema Definition ---
const AnalyzeSyntaxInputSchema = z.object({
  code: z.string().describe('The source code (Java or C++) to analyze for syntax.'),
  language: z.enum(['java', 'cpp']).describe('The programming language of the source code.'),
});
export type AnalyzeSyntaxInput = z.infer<typeof AnalyzeSyntaxInputSchema>;

// --- Output Schema Definition ---
const AnalyzeSyntaxOutputSchema = z.object({
  parseTree: z.array(z.string()).optional().describe('A textual, simplified representation of the Parse Tree (Concrete Syntax Tree), line by line. This should show the full derivation of the input according to the grammar, including terminals and non-terminals. Example: "- Program - DeclarationStatement - TypeSpecifier - \'int\'..."'),
  astRepresentation: z.array(z.string()).optional().describe('A textual, simplified representation of the Abstract Syntax Tree (AST), line by line. This should be a high-level tree structure. If generating a full AST is too complex, describe the main syntax constructs and their relationships.'),
  syntaxErrors: z.array(z.string()).optional().describe('A list of syntax error messages found in the code. For each error, include the line number and a clear description of the issue.'),
  parseStatus: z.string().describe('A brief status of the parsing attempt (e.g., "Parsed successfully, AST and Parse Tree generated", "Syntax errors found", "Partial AST generated due to errors").')
});
export type AnalyzeSyntaxOutput = z.infer<typeof AnalyzeSyntaxOutputSchema>;


// --- Public Wrapper Function ---
/**
 * Analyzes the syntax of the given source code using an AI model.
 * @param input The source code and language.
 * @returns A promise that resolves to the syntax analysis results.
 */
export async function analyzeSyntax(input: AnalyzeSyntaxInput): Promise<AnalyzeSyntaxOutput> {
  return analyzeSyntaxFlow(input);
}

// --- Genkit Prompt Definition ---
const syntaxAnalysisPrompt = ai.definePrompt({
  name: 'syntaxAnalysisPrompt',
  input: { schema: AnalyzeSyntaxInputSchema },
  output: { schema: AnalyzeSyntaxOutputSchema },
  prompt: `You are an expert compiler frontend developer. Your task is to perform syntax analysis (parsing) on the given {{language}} source code.

Your goal is to either:
1.  Generate a simplified, textual representation of the Parse Tree (Concrete Syntax Tree). This tree should show how the source code is derived from the grammar rules, including all terminals (tokens like 'int', 'x', '=', '5', ';') and non-terminals (grammar rules like DeclarationStatement, TypeSpecifier, Expression). Represent the tree structure clearly, perhaps using indentation.
    Example Parse Tree for 'int x = 5;':
    - Program
        - DeclarationStatement
            - TypeSpecifier
                - 'int'
            - DeclaratorList
                - Declarator
                    - Identifier: 'x'
            - '='
            - Initializer
                - Literal
                    - '5'
            - ';'

2.  Generate a simplified, textual representation of the Abstract Syntax Tree (AST). Focus on the main structures like class declarations, method declarations, statements (assignments, conditionals, loops), expressions. Represent the tree structure clearly, perhaps using indentation.
    Example of AST representation for 'int x = 5;':
    - Program
        - VariableDeclaration
            - Type: int
            - Identifier: x
            - Initializer: Literal (5)

3.  If there are syntax errors, list them clearly. For each error, specify the likely line number and a description of what is wrong (e.g., "Missing semicolon", "Unbalanced parentheses", "Unexpected token").

If a Parse Tree, AST (even partial), and errors can be generated, provide all of them.
Prioritize identifying common syntax errors if the code is malformed. If the code is syntactically correct, prioritize generating both the Parse Tree and the AST.

Source Code ({{language}}):
\`\`\`{{language}}
{{{code}}}
\`\`\`

Provide the output as JSON conforming to the output schema. Ensure 'parseTree' and 'astRepresentation' are arrays of strings (lines of the respective trees) and 'syntaxErrors' is an array of error message strings. Set 'parseStatus' appropriately.
`,
});


// --- Genkit Flow Definition ---
const analyzeSyntaxFlow = ai.defineFlow(
  {
    name: 'analyzeSyntaxFlow',
    inputSchema: AnalyzeSyntaxInputSchema,
    outputSchema: AnalyzeSyntaxOutputSchema,
  },
  async (input) => {
    console.log('Analyzing syntax for:', input.language);

    const { output } = await syntaxAnalysisPrompt(input);

    if (!output) {
       console.error('Syntax analysis failed: No output from model.');
       throw new Error('Syntax analysis failed: No output received from the model.');
    }
    if (!output.parseStatus) {
        console.warn('Syntax analysis output missing parseStatus. Setting a default.');
        output.parseStatus = "Analysis complete, but status not specified by model.";
    }

    console.log('Syntax analysis output:', output);
    return output;
  }
);

