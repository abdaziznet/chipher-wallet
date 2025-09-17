
'use server';

import { z } from 'zod';
import { randomBytes } from 'crypto';

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
    const bytes = randomBytes(1);
    requiredChars.push(lowerCaseChars[bytes[0] % lowerCaseChars.length]);
  }
  if (includeUppercase) {
    charPool += upperCaseChars;
    const bytes = randomBytes(1);
    requiredChars.push(upperCaseChars[bytes[0] % upperCaseChars.length]);
  }
  if (includeNumbers) {
    charPool += numberChars;
    const bytes = randomBytes(1);
    requiredChars.push(numberChars[bytes[0] % numberChars.length]);
  }
  if (includeSymbols) {
    charPool += symbolChars;
    const bytes = randomBytes(1);
    requiredChars.push(symbolChars[bytes[0] % symbolChars.length]);
  }


  if (charPool === '') {
    return ''; // Or throw an error if no character types are selected
  }
  
  let passwordArray = [...requiredChars];
  const remainingLength = length - requiredChars.length;
  
  if (remainingLength > 0) {
    const randomValues = randomBytes(remainingLength);
    for (let i = 0; i < remainingLength; i++) {
        const randomIndex = randomValues[i] % charPool.length;
        passwordArray.push(charPool[randomIndex]);
    }
  }

  // Shuffle the array to ensure random placement of required characters
  // Fisher-Yates shuffle algorithm
  const shuffleBytes = randomBytes(passwordArray.length);
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.slice(0, length).join('');
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
