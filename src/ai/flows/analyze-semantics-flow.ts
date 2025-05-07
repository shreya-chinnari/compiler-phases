
'use server';
/**
 * @fileOverview Performs semantic analysis on Java or C++ source code, identifying common semantic errors and warnings.
 *
 * - analyzeSemantics - A function that calls the Genkit flow to perform semantic analysis.
 * - AnalyzeSemanticsInput - The input type for the analyzeSemantics function.
 * - AnalyzeSemanticsOutput - The return type for the analyzeSemantics function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Input Schema Definition ---
const AnalyzeSemanticsInputSchema = z.object({
  code: z.string().describe('The source code (Java or C++) to analyze for semantics.'),
  language: z.enum(['java', 'cpp']).describe('The programming language of the source code.'),
  // Optionally, you could include symbol table or AST data here if available from previous steps
  // symbolTableSnapshot: z.any().optional().describe('A snapshot of the symbol table, if available.'),
  // astSnapshot: z.any().optional().describe('A snapshot of the AST, if available.')
});
export type AnalyzeSemanticsInput = z.infer<typeof AnalyzeSemanticsInputSchema>;

// --- Output Schema Definition ---
const AnalyzeSemanticsOutputSchema = z.object({
  semanticErrors: z.array(z.string()).optional().describe('A list of semantic error messages (e.g., type mismatches, undeclared variables, scope issues, incorrect function arguments). Include line numbers if possible.'),
  warnings: z.array(z.string()).optional().describe('A list of semantic warnings (e.g., unused variables, potential null pointer issues, unreachable code). Include line numbers if possible.'),
  analysisSummary: z.string().describe('A brief summary of the semantic analysis performed (e.g., "No semantic errors found", "Semantic issues detected", "Type checking completed").')
});
export type AnalyzeSemanticsOutput = z.infer<typeof AnalyzeSemanticsOutputSchema>;


// --- Public Wrapper Function ---
/**
 * Performs semantic analysis on the given source code using an AI model.
 * @param input The source code and language.
 * @returns A promise that resolves to the semantic analysis results.
 */
export async function analyzeSemantics(input: AnalyzeSemanticsInput): Promise<AnalyzeSemanticsOutput> {
  return analyzeSemanticsFlow(input);
}

// --- Genkit Prompt Definition ---
const semanticAnalysisPrompt = ai.definePrompt({
  name: 'semanticAnalysisPrompt',
  input: { schema: AnalyzeSemanticsInputSchema },
  output: { schema: AnalyzeSemanticsOutputSchema },
  prompt: `You are an expert compiler designer specializing in semantic analysis for {{language}} code.
Your task is to analyze the provided source code for common semantic issues.

Consider the following types of semantic checks:
1.  **Type Checking:** Verify type compatibility in assignments, operations, function calls, and return statements. (e.g., "Type mismatch: cannot assign string to int variable 'x' at line Y").
2.  **Declaration Checks:** Ensure all variables, functions, and classes are declared before use. (e.g., "Undeclared identifier 'myVar' at line Y").
3.  **Scope Resolution:** Check if identifiers are used within their valid scopes. (e.g., "Variable 'temp' is out of scope at line Y").
4.  **Function Call Analysis:** Validate the number and types of arguments passed to functions/methods against their definitions. (e.g., "Incorrect number of arguments for function 'calculate'. Expected 2, got 3 at line Y").
5.  **Reachability/Dead Code:** Identify parts of the code that are unreachable (optional, as a warning).
6.  **Use of Uninitialized Variables:** Check for variables being used before they are assigned a value (optional, as a warning).

For each error or warning found, provide:
- A clear description of the issue.
- The approximate line number where the issue occurs.

If no errors or warnings are found, state that semantic checks passed.

Source Code ({{language}}):
\`\`\`{{language}}
{{{code}}}
\`\`\`

Provide the output as JSON conforming to the output schema. Ensure 'semanticErrors' and 'warnings' are arrays of strings, and 'analysisSummary' provides a concise overview.
`,
});


// --- Genkit Flow Definition ---
const analyzeSemanticsFlow = ai.defineFlow(
  {
    name: 'analyzeSemanticsFlow',
    inputSchema: AnalyzeSemanticsInputSchema,
    outputSchema: AnalyzeSemanticsOutputSchema,
  },
  async (input) => {
    console.log('Analyzing semantics for:', input.language);

    const { output } = await semanticAnalysisPrompt(input);

    if (!output) {
       console.error('Semantic analysis failed: No output from model.');
       throw new Error('Semantic analysis failed: No output received from the model.');
    }
    if (!output.analysisSummary) {
        console.warn('Semantic analysis output missing analysisSummary. Setting a default.');
        output.analysisSummary = "Analysis complete, but summary not specified by model.";
    }
    console.log('Semantic analysis output:', output);
    return output;
  }
);
