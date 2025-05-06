
'use server';
/**
 * @fileOverview Generates simplified machine code for Java or C++ source code.
 *
 * - generateMachineCode - A function that calls the Genkit flow to generate machine code.
 * - GenerateMachineCodeInput - The input type for the generateMachineCode function.
 * - GenerateMachineCodeOutput - The return type for the generateMachineCode function.
 */

import { ai } from '@/ai/genkit'; // Use the pre-configured ai object
import { z } from 'zod'; // Use the standard zod import

// --- Input Schema Definition ---
const GenerateMachineCodeInputSchema = z.object({
  code: z.string().describe('The source code (Java or C++) to generate machine code for.'),
  language: z.enum(['java', 'cpp']).describe('The programming language of the source code.'),
});
export type GenerateMachineCodeInput = z.infer<typeof GenerateMachineCodeInputSchema>;

// --- Output Schema Definition ---
const GenerateMachineCodeOutputSchema = z.object({
  machineCode: z.array(z.string()).describe('An array of strings representing simplified machine code instructions (e.g., "LOAD R1, var_a", "ADD R1, R2", "STORE result, R1").'),
});
export type GenerateMachineCodeOutput = z.infer<typeof GenerateMachineCodeOutputSchema>;


// --- Public Wrapper Function ---
/**
 * Generates simplified machine code for the given source code using an AI model.
 * @param input The source code and language.
 * @returns A promise that resolves to the generated machine code instructions.
 */
export async function generateMachineCode(input: GenerateMachineCodeInput): Promise<GenerateMachineCodeOutput> {
  return generateMachineCodeFlow(input);
}

// --- Genkit Prompt Definition ---
const machineCodePrompt = ai.definePrompt({
  name: 'generateMachineCodePrompt',
  input: { schema: GenerateMachineCodeInputSchema },
  output: { schema: GenerateMachineCodeOutputSchema },
  prompt: `You are an expert compiler engineer. Your task is to generate simplified, human-readable machine code (assembly-like instructions) for the given {{language}} source code.

Focus on the core logic: variable assignments, arithmetic operations, basic control flow (if/loops - represent jumps/labels).

Keep the instruction set simple:
- LOAD R<n>, <variable/value>  (Load data into register R<n>)
- STORE <variable>, R<n>       (Store register value into variable)
- ADD R<n>, R<m>             (Add R<m> to R<n>, store in R<n>)
- SUB R<n>, R<m>             (Subtract R<m> from R<n>, store in R<n>)
- MUL R<n>, R<m>             (Multiply R<n> by R<m>, store in R<n>)
- DIV R<n>, R<m>             (Divide R<n> by R<m>, store in R<n>)
- CMP R<n>, R<m>             (Compare R<n> and R<m>, set flags)
- JMP <label>                (Unconditional jump to label)
- JEQ <label>                (Jump to label if equal flag is set)
- JNE <label>                (Jump to label if not equal flag is set)
- JGT <label>                (Jump to label if greater than flag is set)
- JLT <label>                (Jump to label if less than flag is set)
- JGE <label>                (Jump to label if greater than or equal flag is set)
- JLE <label>                (Jump to label if less than or equal flag is set)
- LABEL <label_name>:        (Define a label)
- CALL <function_name>       (Call a function)
- RET                      (Return from function)
- PUSH <value/register>      (Push onto stack)
- POP R<n>                 (Pop from stack into register)

Use temporary registers (R1, R2, etc.) as needed. Assume a simple register machine model.
Do not generate actual binary code. Provide the output as an array of strings, where each string is one machine code instruction.

Source Code ({{language}}):
\`\`\`{{language}}
{{{code}}}
\`\`\`

Generate the simplified machine code instructions based on this code.
`,
});


// --- Genkit Flow Definition ---
const generateMachineCodeFlow = ai.defineFlow(
  {
    name: 'generateMachineCodeFlow',
    inputSchema: GenerateMachineCodeInputSchema,
    outputSchema: GenerateMachineCodeOutputSchema,
  },
  async (input) => {
    console.log('Generating machine code for:', input.language); // Add logging

    const { output } = await machineCodePrompt(input);

    if (!output) {
       console.error('Machine code generation failed: No output from model.');
       throw new Error('Machine code generation failed: No output received from the model.');
    }

    console.log('Generated machine code output:', output); // Add logging

    // Ensure the output format is correct
    if (!Array.isArray(output.machineCode)) {
      console.error('Machine code generation failed: Output is not an array.');
      throw new Error('Machine code generation failed: Expected an array of strings.');
    }

    return output;
  }
);
