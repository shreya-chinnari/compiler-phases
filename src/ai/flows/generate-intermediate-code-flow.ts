'use server';
/**
 * @fileOverview Generates Intermediate Code (Quadruple, Triple, Indirect Triple) for Java or C++ source code.
 *
 * - generateIntermediateCode - A function that calls the Genkit flow to generate IC.
 * - GenerateIntermediateCodeInput - The input type for the generateIntermediateCode function.
 * - GenerateIntermediateCodeOutput - The return type for the generateIntermediateCode function.
 */

import { ai } from '@/ai/genkit'; // Use the pre-configured ai object
import { z } from 'zod'; // Use the standard zod import

// --- Input Schema Definition ---
const GenerateIntermediateCodeInputSchema = z.object({
  code: z.string().describe('The source code (Java or C++) to generate intermediate code for.'),
  language: z.enum(['java', 'cpp']).describe('The programming language of the source code.'),
});
export type GenerateIntermediateCodeInput = z.infer<typeof GenerateIntermediateCodeInputSchema>;

// --- Output Schema Definition ---
// Outputting as arrays of strings for simplicity in generation and display
const GenerateIntermediateCodeOutputSchema = z.object({
  quadruples: z.array(z.string()).describe('Array of strings representing Quadruple instructions (e.g., "(+, b, c, t1)").'),
  triples: z.array(z.string()).describe('Array of strings representing Triple instructions (e.g., "(0: +, b, c)").'),
  indirectTriples: z.object({
      instructions: z.array(z.string()).describe('Array of pointers/indices referencing the triples table (e.g., "(0)", "(1)").'),
      triplesTable: z.array(z.string()).describe('Array of strings representing the Triples table for Indirect Triples (e.g., "(0: *, c, d)", "(1: +, b, (0))").')
  }).describe('Object containing the instruction list and the triples table for Indirect Triples.')
});
export type GenerateIntermediateCodeOutput = z.infer<typeof GenerateIntermediateCodeOutputSchema>;


// --- Public Wrapper Function ---
/**
 * Generates intermediate code representations for the given source code using an AI model.
 * @param input The source code and language.
 * @returns A promise that resolves to the generated intermediate code representations.
 */
export async function generateIntermediateCode(input: GenerateIntermediateCodeInput): Promise<GenerateIntermediateCodeOutput> {
  return generateIntermediateCodeFlow(input);
}

// --- Genkit Prompt Definition ---
const intermediateCodePrompt = ai.definePrompt({
  name: 'generateIntermediateCodePrompt',
  input: { schema: GenerateIntermediateCodeInputSchema },
  output: { schema: GenerateIntermediateCodeOutputSchema },
  prompt: `You are an expert compiler designer. Your task is to generate three forms of Intermediate Code (IC) for the given {{language}} source code: Quadruples, Triples, and Indirect Triples.

Analyze the provided source code line by line, focusing on assignments, arithmetic operations, logical operations, relational operations, and basic control flow structures (like simple if statements). Use temporary variables (t1, t2, ...) as needed.

Generate the output in the following formats:

1.  **Quadruples:** Represent each operation as \`(operator, argument1, argument2, result)\`. For unary operators, argument2 can be null/empty. For assignments, the operator is often '='.
    Example for \`a = b + c * d;\`:
    (\*, c, d, t1)
    (+, b, t1, t2)
    (=, t2, -, a) // Using '-' to indicate the result destination

2.  **Triples:** Represent each operation as \`(instruction_index: operator, argument1, argument2)\`. Arguments can be variable names, constants, or references to previous triple indices like \`(index)\`.
    Example for \`a = b + c * d;\`:
    (0: \*, c, d)
    (1: +, b, (0))
    (2: =, a, (1))

3.  **Indirect Triples:** This involves two parts:
    *   **Triples Table:** Same format as Triples, but indices start from 0.
    *   **Instructions:** A list of pointers (indices) into the Triples Table, showing the execution order.
    Example for \`a = b + c * d;\`:
    *   Triples Table:
        (0: \*, c, d)
        (1: +, b, (0))
        (2: =, a, (1))
    *   Instructions:
        (0)
        (1)
        (2)

Provide the output as JSON conforming to the output schema, with each IC type represented as an array of strings as described above.

Source Code ({{language}}):
\`\`\`{{language}}
{{{code}}}
\`\`\`

Generate the Quadruples, Triples, and Indirect Triples based on this code.
`,
});


// --- Genkit Flow Definition ---
const generateIntermediateCodeFlow = ai.defineFlow(
  {
    name: 'generateIntermediateCodeFlow',
    inputSchema: GenerateIntermediateCodeInputSchema,
    outputSchema: GenerateIntermediateCodeOutputSchema,
  },
  async (input) => {
    console.log('Generating Intermediate Code for:', input.language); // Add logging

    const { output } = await intermediateCodePrompt(input);

    if (!output) {
       console.error('Intermediate Code generation failed: No output from model.');
       throw new Error('Intermediate Code generation failed: No output received from the model.');
    }

    console.log('Generated Intermediate Code output:', output); // Add logging

    // Basic validation of the output structure
    if (!output.quadruples || !output.triples || !output.indirectTriples?.instructions || !output.indirectTriples?.triplesTable) {
      console.error('Intermediate Code generation failed: Output structure is incorrect.');
      throw new Error('Intermediate Code generation failed: Expected specific structure for quadruples, triples, and indirect triples.');
    }

    return output;
  }
);
