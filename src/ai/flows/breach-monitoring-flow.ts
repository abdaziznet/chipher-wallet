
'use server';

/**
 * @fileOverview A Genkit flow for checking if an email has been involved in any known data breaches.
 *
 * - checkBreaches - A function that handles the breach checking process.
 * - BreachCheckInput - The input type for the checkBreaches function.
 * - BreachCheckOutput - The return type for the checkBreaches function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BreachCheckInputSchema = z.object({
  email: z.string().email().describe('The email address to check for breaches.'),
});
export type BreachCheckInput = z.infer<typeof BreachCheckInputSchema>;

const BreachDetailsSchema = z.object({
    name: z.string().describe('The name of the service or company that was breached.'),
    date: z.string().describe('The date the breach occurred (YYYY-MM-DD).'),
    compromisedData: z.array(z.string()).describe('A list of the types of data that were compromised (e.g., "Email addresses", "Passwords", "Usernames").'),
    description: z.string().describe('A brief description of the breach incident.'),
});

const BreachCheckOutputSchema = z.object({
    breaches: z.array(BreachDetailsSchema).describe('An array of data breaches found for the given email.'),
    error: z.string().optional().describe('Any error message if the check could not be completed.'),
});

export type BreachCheckOutput = z.infer<typeof BreachCheckOutputSchema>;

export async function checkBreaches(email: string): Promise<BreachCheckOutput> {
  return breachCheckFlow({ email });
}

const prompt = ai.definePrompt({
  name: 'breachCheckPrompt',
  input: { schema: BreachCheckInputSchema },
  output: { schema: BreachCheckOutputSchema },
  prompt: `You are a cybersecurity expert specializing in data breach analysis. Your task is to determine if the following email address has been compromised in any publicly known data breaches.

Email Address: {{{email}}}

Use your knowledge of historical data breaches to identify any incidents where this email might have been exposed. For each breach you find, provide the name of the breached service, the date of the breach, a description, and a list of the data types that were compromised.

If you find no evidence of the email in any known breaches, return an empty array for the 'breaches' field. If you are unable to perform the check, provide a reason in the 'error' field.
`,
});

const breachCheckFlow = ai.defineFlow(
  {
    name: 'breachCheckFlow',
    inputSchema: BreachCheckInputSchema,
    outputSchema: BreachCheckOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output || { breaches: [] };
    } catch (error) {
      console.error('Error in breach check flow:', error);
      return { 
        breaches: [],
        error: 'An unexpected error occurred while checking for breaches.' 
      };
    }
  }
);
