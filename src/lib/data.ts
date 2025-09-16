import type { PasswordEntry } from './types';

export const mockPasswords: PasswordEntry[] = [
  {
    id: 'pw_1',
    appName: 'Google',
    username: 'user@gmail.com',
    password: 'MockPassword123!',
    website: 'https://google.com',
  },
  {
    id: 'pw_2',
    appName: 'GitHub',
    username: 'dev_user',
    password: 'SecureGitHubPass$',
    website: 'https://github.com',
  },
  {
    id: 'pw_3',
    appName: 'Twitter / X',
    username: 'social_butterfly',
    password: 'MyTweetPassword#22',
    website: 'https://x.com',
  },
  {
    id: 'pw_4',
    appName: 'Netflix',
    username: 'movie.lover@email.com',
    password: 'Netflix&Chill?2024',
    website: 'https://netflix.com',
  },
  {
    id: 'pw_5',
    appName: 'Amazon',
    username: 'shopaholic@provider.com',
    password: 'AmazonPrimeTime!',
    website: 'https://amazon.com',
  },
];
