
'use server';

import { z } from 'zod';
import { generate } from 'generate-password';

const formSchema = z.object({
  length: z.coerce.number().min(8).max(64),
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

  try {
    const password = generate({
      length: parsed.data.length,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
    });
    return { password };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate password. Please try again.' };
  }
}
