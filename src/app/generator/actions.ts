
'use server';

import { generateStrongPassword } from '@/ai/flows/generate-strong-password';
import { z } from 'zod';

const formSchema = z.object({
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
  // Unchecked switches don't appear in formData, so we need to provide defaults
  const dataWithDefaults = {
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: false,
    includeSymbols: false,
    ...data,
  };
  const parsed = formSchema.safeParse(dataWithDefaults);


  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { error: 'Invalid form data.' };
  }

  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  } = parsed.data;

  try {
    const result = await generateStrongPassword({
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
