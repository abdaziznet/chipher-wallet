'use server';

/**
 * @fileOverview Password generator flow using Genkit.
 *
 * - generateStrongPassword - A function that generates a strong password based on user-defined criteria.
 * - GeneratePasswordInput - The input type for the generateStrongPassword function.
 * - GeneratePasswordOutput - The return type for the generateStrongPassword function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePasswordInputSchema = z.object({
  userInput: z.string().optional().describe('Keywords or phrases to base the password on.'),
  length: z.number().min(8).max(64).default(16).describe('Length of the password.'),
  includeUppercase: z.boolean().default(true).describe('Include uppercase letters.'),
  includeLowercase: z.boolean().default(true).describe('Include lowercase letters.'),
  includeNumbers: z.boolean().default(true).describe('Include numbers.'),
  includeSymbols: z.boolean().default(true).describe('Include symbols.'),
});
export type GeneratePasswordInput = z.infer<typeof GeneratePasswordInputSchema>;

const GeneratePasswordOutputSchema = z.object({
  password: z.string().describe('The generated password.'),
});
export type GeneratePasswordOutput = z.infer<typeof GeneratePasswordOutputSchema>;

export async function generateStrongPassword(input: GeneratePasswordInput): Promise<GeneratePasswordOutput> {
  return generateStrongPasswordFlow(input);
}

const generatePasswordPrompt = ai.definePrompt({
  name: 'generatePasswordPrompt',
  input: {schema: GeneratePasswordInputSchema},
  output: {schema: GeneratePasswordOutputSchema},
  prompt: `You are a password generator. Generate a strong, random password based on the following criteria:

{{#if userInput}}
Incorporate the following keywords or phrases into the password in a creative but secure way: "{{{userInput}}}"
{{/if}}

Length: {{{length}}}
Include uppercase letters: {{{includeUppercase}}}
Include lowercase letters: {{{includeLowercase}}}
Include numbers: {{{includeNumbers}}}
Include symbols: {{{includeSymbols}}}

The password should be highly secure and difficult to guess. Mix the user's input with random characters to ensure security.
\nEnsure the password meets the specified criteria. Do not include any explanation or justification in the response, only the generated password.`,
});

const generateStrongPasswordFlow = ai.defineFlow(
  {
    name: 'generateStrongPasswordFlow',
    inputSchema: GeneratePasswordInputSchema,
    outputSchema: GeneratePasswordOutputSchema,
  },
  async input => {
    const {output} = await generatePasswordPrompt(input);
    return output!;
  }
);
