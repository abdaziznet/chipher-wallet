# **App Name**: CipherWallet

## Core Features:

- Encrypted Password Storage: Securely save account/app names, usernames/emails, and AES-256-GCM encrypted passwords using sqflite.
- Password Copy with Decryption: Decrypt and copy passwords to the clipboard with a simple button click.
- Google Drive Backup: Create a feature that provides backup of the encrypted database to Google Drive.
- Database Restore: Restore the database from a .db file stored locally or in Google Drive.
- PIN/Biometric Authentication: Enable optional PIN or biometric authentication to unlock the app.
- Password Generator: A tool for creating strong, random passwords based on user-specified criteria, such as length, inclusion of uppercase letters, lowercase letters, numbers, and symbols.
- Search and Filter Passwords: Quickly find passwords with a search and filter function.

## Style Guidelines:

- Background color: Very light grayish-blue (#F0F4F8) to create a clean, modern feel.
- Primary color: Medium-dark teal (#337B7B) to create a balanced, trustworthy feel.
- Accent color: Vibrant orange (#E07A5F) for action items.
- Body and headline font: 'PT Sans', a sans-serif font known for its modern and clear appearance that's suitable for both headlines and body text.
- Simple, modern icons for app logos and menu items.
- Use BottomNavigationBar for main menu and a clear, searchable list for password display.
- Subtle animations for transitions and user feedback, such as password copy confirmation.