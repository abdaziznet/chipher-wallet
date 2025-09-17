
'use server';

import { z } from 'zod';
import { randomBytes } from 'crypto';

const formSchema = z.object({
  length: z.coerce.number().min(8).max(64),
});


type State = {
  password?: string;
  error?: string;
};

function createStrongPassword(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let passwordArray = [];
  const randomValues = randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % chars.length;
    passwordArray.push(chars[randomIndex]);
  }
  
  return passwordArray.join('');
}


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
    const password = createStrongPassword(parsed.data.length);
    return { password };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate password. Please try again.' };
  }
}
