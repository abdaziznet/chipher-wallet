
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

// Function to generate a password using crypto module
function createStrongPassword(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const randomValues = new Uint32Array(length);
    const result = [];
    
    // Fill array with random values
    const buffer = randomBytes(length * 4);
    for (let i = 0; i < length; i++) {
        randomValues[i] = buffer.readUInt32LE(i * 4);
    }
    
    for (let i = 0; i < length; i++) {
        result.push(chars[randomValues[i] % chars.length]);
    }
    
    return result.join('');
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
