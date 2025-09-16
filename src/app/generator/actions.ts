'use server';

import { generateStrongPassword } from '@/ai/flows/generate-strong-password';
import { z } from 'zod';

const formSchema = z.object({
  length: z.coerce.number().min(8).max(64),
  includeUppercase: z.string().transform(v => v === 'on' || v === 'true').or(z.boolean()),
  includeLowercase: z.string().transform(v => v === 'on' || v === 'true').or(z.boolean()),
  includeNumbers: z.string().transform(v => v === 'on' || v === 'true').or(z.boolean()),
  includeSymbols: z.string().transform(v => v === 'on' || v === 'true').or(z.boolean()),
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
