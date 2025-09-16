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
  prompt: `You are a password generator. Generate a strong, random password based on the following criteria:\n\nLength: {{{length}}}\nInclude uppercase letters: {{{includeUppercase}}}\nInclude lowercase letters: {{{includeLowercase}}}\nInclude numbers: {{{includeNumbers}}}\nInclude symbols: {{{includeSymbols}}}\n\nThe password should be highly secure and difficult to guess.
\nEnsure the password meets the specified criteria. Do not include any explanation or justification in the response, only the generated password.`, // Changed to request only the password in the output
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
