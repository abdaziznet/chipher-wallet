
'use server';

import { z } from 'zod';

const formSchema = z.object({
  length: z.coerce.number().min(8).max(64),
  includeUppercase: z.coerce.boolean().default(false),
  includeLowercase: z.coerce.boolean().default(false),
  includeNumbers: z.coerce.boolean().default(false),
  includeSymbols: z.coerce.boolean().default(false),
});


type State = {
  password?: string;
  error?: string;
};

function createStrongPassword(options: z.infer<typeof formSchema>): string {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  } = options;

  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charPool = '';
  const requiredChars: string[] = [];

  if (includeLowercase) {
    charPool += lowerCaseChars;
    requiredChars.push(lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)]);
  }
  if (includeUppercase) {
    charPool += upperCaseChars;
    requiredChars.push(upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)]);
  }
  if (includeNumbers) {
    charPool += numberChars;
    requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  }
  if (includeSymbols) {
    charPool += symbolChars;
    requiredChars.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
  }

  if (charPool === '') {
    return ''; // Or throw an error if no character types are selected
  }

  let passwordArray = [...requiredChars];
  
  for (let i = requiredChars.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    passwordArray.push(charPool[randomIndex]);
  }

  // Shuffle the array to ensure random placement of required characters
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}


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

  if (
    !parsed.data.includeLowercase &&
    !parsed.data.includeUppercase &&
    !parsed.data.includeNumbers &&
    !parsed.data.includeSymbols
  ) {
    return { error: 'Please select at least one character type.' };
  }

  try {
    const password = createStrongPassword(parsed.data);
    return { password };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate password. Please try again.' };
  }
}
