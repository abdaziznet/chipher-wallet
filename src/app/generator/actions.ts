
'use server';

import { generateStrongPassword } from '@/ai/flows/generate-strong-password';
import { z } from 'zod';

const formSchema = z.object({
  userInput: z.string().optional(),
  length: z.coerce.number().min(8).max(64),
  includeUppercase: z.string().transform(v => v === 'on').or(z.boolean()).default(false),
  includeLowercase: z.string().transform(v => v === 'on').or(z.boolean()).default(false),
  includeNumbers: z.string().transform(v => v === 'on').or(z.boolean()).default(false),
  includeSymbols: z.string().transform(v => v === 'on').or(z.boolean()).default(false),
});


type State = {
  password?: string;
  error?: string;
};

export async function generatePasswordAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const data = Object.fromEntries(formData);
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { error: 'Invalid form data.' };
  }

  const {
    userInput,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  } = parsed.data;

  try {
    const result = await generateStrongPassword({
      userInput,
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });
    return { password: result.password };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate password. Please try again.' };
  }
}
