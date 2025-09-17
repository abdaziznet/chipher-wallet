
'use server';

import * as crypto from 'crypto';

interface GeneratePasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export async function generatePasswordAction(
  options: GeneratePasswordOptions
): Promise<{ password?: string; error?: string }> {
  try {
    const password = createStrongPassword(options);
    return { password };
  } catch (error) {
    console.error('Failed to generate password:', error);
    return { error: 'Failed to generate password.' };
  }
}

function createStrongPassword({
  length,
  includeNumbers,
  includeSymbols,
}: GeneratePasswordOptions): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lower + upper;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;

  let password = '';
  const passwordChars = new Set<string>();
  
  // Ensure the password includes at least one of each required character type
  if (includeNumbers) {
    passwordChars.add(numbers[crypto.randomInt(numbers.length)]);
  }
  if (includeSymbols) {
    passwordChars.add(symbols[crypto.randomInt(symbols.length)]);
  }
   passwordChars.add(lower[crypto.randomInt(lower.length)]);
   passwordChars.add(upper[crypto.randomInt(upper.length)]);


  while (passwordChars.size < length) {
    const randomIndex = crypto.randomInt(chars.length);
    passwordChars.add(chars[randomIndex]);
  }
  
  // Convert set to array and shuffle it
  const shuffledChars = Array.from(passwordChars);
  for (let i = shuffledChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [shuffledChars[i], shuffledChars[j]] = [shuffledChars[j], shuffledChars[i]];
  }

  return shuffledChars.join('');
}
