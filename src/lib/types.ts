
export type User = {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: 'guest' | 'admin';
  password?: string; // Encrypted password
};

export const passwordCategories = ['banking', 'email', 'social media', 'game', 'productivity', 'other'] as const;
export type PasswordCategory = (typeof passwordCategories)[number];


export type PasswordEntry = {
  id: string;
  userId: string;
  appName: string;
  username: string;
  password: string;
  website?: string;
  category: PasswordCategory;
};
