
'use server';

/**
 * @fileoverview Genkit flow for managing passwords stored in Google Sheets.
 * This file defines flows for creating, reading, updating, and deleting password entries.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getPasswords as getPasswordsFromSheet,
  addPassword as addPasswordToSheet,
  updatePassword as updatePasswordInSheet,
  deletePassword as deletePasswordFromSheet,
  deletePasswords as deletePasswordsFromSheet,
} from '@/services/google-sheets';
import type { PasswordEntry } from '@/lib/types';
import { passwordCategories } from '@/lib/types';

// Schemas for data validation
const PasswordEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  appName: z.string(),
  username: z.string(),
  password: z.string(),
  website: z.string().optional(),
  category: z.enum(passwordCategories),
});

const GetPasswordsInputSchema = z.object({
  userId: z.string(),
});
const GetPasswordsOutputSchema = z.array(PasswordEntrySchema);

const AddPasswordInputSchema = z.object({
  userId: z.string(),
  appName: z.string(),
  username: z.string(),
  password: z.string(),
  website: z.string().optional(),
  category: z.enum(passwordCategories),
});
const AddPasswordOutputSchema = PasswordEntrySchema;

const UpdatePasswordInputSchema = PasswordEntrySchema;
const UpdatePasswordOutputSchema = PasswordEntrySchema;

const DeletePasswordInputSchema = z.object({
  id: z.string(),
});
const DeletePasswordOutputSchema = z.object({
  success: z.boolean(),
});

const DeletePasswordsInputSchema = z.object({
  ids: z.array(z.string()),
});


// Exported functions that components can call
export async function getPasswords(userId: string): Promise<PasswordEntry[]> {
  return getPasswordsFlow({ userId });
}

export async function addPassword(input: z.infer<typeof AddPasswordInputSchema>): Promise<PasswordEntry> {
  return addPasswordFlow(input);
}

export async function updatePassword(input: PasswordEntry): Promise<PasswordEntry> {
  return updatePasswordFlow(input);
}

export async function deletePassword(id: string): Promise<{ success: boolean }> {
  return deletePasswordFlow({ id });
}

export async function deletePasswords(ids: string[]): Promise<{ success: boolean }> {
    return deletePasswordsFlow({ ids });
}


// Genkit Flows
const getPasswordsFlow = ai.defineFlow(
  {
    name: 'getPasswordsFlow',
    inputSchema: GetPasswordsInputSchema,
    outputSchema: GetPasswordsOutputSchema,
  },
  async ({ userId }) => {
    return await getPasswordsFromSheet(userId);
  }
);

const addPasswordFlow = ai.defineFlow(
  {
    name: 'addPasswordFlow',
    inputSchema: AddPasswordInputSchema,
    outputSchema: AddPasswordOutputSchema,
  },
  async (input) => {
    return await addPasswordToSheet(input);
  }
);

const updatePasswordFlow = ai.defineFlow(
  {
    name: 'updatePasswordFlow',
    inputSchema: UpdatePasswordInputSchema,
    outputSchema: UpdatePasswordOutputSchema,
  },
  async (input) => {
    return await updatePasswordInSheet(input);
  }
);

const deletePasswordFlow = ai.defineFlow(
  {
    name: 'deletePasswordFlow',
    inputSchema: DeletePasswordInputSchema,
    outputSchema: DeletePasswordOutputSchema,
  },
  async ({ id }) => {
    await deletePasswordFromSheet(id);
    return { success: true };
  }
);

const deletePasswordsFlow = ai.defineFlow(
  {
    name: 'deletePasswordsFlow',
    inputSchema: DeletePasswordsInputSchema,
    outputSchema: DeletePasswordOutputSchema,
  },
  async ({ ids }) => {
    await deletePasswordsFromSheet(ids);
    return { success: true };
  }
);
