export type User = {
  id: string;
  name: string;
  email: string;
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
