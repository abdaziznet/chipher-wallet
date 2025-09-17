
export type User = {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null;
  role: 'guest' | 'admin';
  password?: string; // Encrypted password
};

export type PasswordEntry = {
  id: string;
  userId: string;
  appName: string;
  username: string;
  password: string;
  website?: string;
};
