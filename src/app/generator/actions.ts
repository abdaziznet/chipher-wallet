
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
  const requiredChars: string[] = [
    lower[crypto.randomInt(lower.length)],
    upper[crypto.randomInt(upper.length)],
  ];

  if (includeNumbers) {
    requiredChars.push(numbers[crypto.randomInt(numbers.length)]);
  }
  if (includeSymbols) {
    requiredChars.push(symbols[crypto.randomInt(symbols.length)]);
  }

  // Fill the rest of the password length with random characters
  for (let i = requiredChars.length; i < length; i++) {
    const randomIndex = crypto.randomInt(chars.length);
    requiredChars.push(chars[randomIndex]);
  }
  
  // Shuffle the array to ensure randomness
  const shuffledChars = requiredChars.slice();
  for (let i = shuffledChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [shuffledChars[i], shuffledChars[j]] = [shuffledChars[j], shuffledChars[i]];
  }

  return shuffledChars.join('');
}
