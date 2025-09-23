# CipherWallet: A Secure Password Manager

CipherWallet is a modern, secure, and user-friendly password manager application built with Next.js and Firebase. It provides a secure way to store, manage, and generate passwords, with a focus on client-side encryption to ensure that only you can access your sensitive information.

## Features

- **Secure Password Storage**: All passwords are encrypted on the client side before being stored, ensuring that the raw data is never exposed.
- **Google Authentication**: Easy and secure login using your Google account, powered by Firebase Authentication.
- **Client-Side Encryption**: Passwords are encrypted and decrypted in your browser using a secret key that you provide. This key is never stored on the server.
- **Password Generation**: A built-in tool to generate strong, customizable passwords with options for length, numbers, and symbols.
- **Search and Filter**: Quickly find passwords with a powerful search bar and filter entries by category.
- **Sortable List**: Organize your password list by account name or by the date they were added.
- **Bulk Operations**: Select and delete multiple passwords at once for efficient management.
- **Role-Based Access**: The application supports an "admin" role with access to additional tools.
- **Admin Crypto Tools**: A dedicated page for admin users to encrypt and decrypt text using AES.
- **Responsive Design**: A clean, modern UI that works seamlessly on both desktop and mobile devices.
- **Light & Dark Mode**: Switch between light and dark themes to suit your preference.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In)
- **Database**: [Google Sheets](https://www.google.com/sheets/about/) (used as a simple, no-setup database for storing encrypted data)
- **AI/Backend Flows**: [Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Client-Side Encryption**: [crypto-js](https://github.com/brix/crypto-js) (AES)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 20 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/abdaziznet/chipher-wallet.git
cd cipherwallet
```

### 2. Install Dependencies

Install the necessary packages using npm or yarn:

```bash
npm install
```

### 3. Set Up Environment Variables

This project uses Google Sheets as a database and Firebase for authentication. You will need to create a `.env` file in the root of your project and add the necessary credentials.

#### a. Create the `.env` file:

```bash
touch .env
```

#### b. Add the following environment variables to your `.env` file:

```env
# Google Sheets API Credentials
GOOGLE_SHEET_ID="YOUR_GOOGLE_SHEET_ID"
GOOGLE_CLIENT_EMAIL="your-service-account-email@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase Project Credentials (for server-side admin tasks)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-service-account-email@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**How to get these credentials:**

1.  **Google Sheet ID**: Create a new Google Sheet. The ID is the long string in the URL: `https://docs.google.com/spreadsheets/d/YOUR_GOOGLE_SHEET_ID/edit`.
2.  **Google Service Account**:
    - Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or use an existing one).
    - Enable the **Google Sheets API**.
    - Go to "Credentials", click "Create Credentials", and select "Service account".
    - Give it a name, and for the role, grant it "Editor" access.
    - After creating the service account, go to its details, click on the "Keys" tab, "Add Key", and "Create new key". Choose **JSON**.
    - A JSON file will be downloaded. Open it to find your `project_id`, `client_email`, and `private_key`.
    - **Important**: Share your Google Sheet with the `client_email` of the service account and give it "Editor" permissions.

3.  **Firebase Credentials**:
    - If you don't already have one, create a project in the [Firebase Console](https://console.firebase.google.com/).
    - This project uses Firebase Authentication for login. The `src/lib/firebase.ts` file already contains a sample client-side configuration. You should replace this with your own project's configuration from the Firebase Console (Project Settings > General > Your apps > Firebase SDK snippet > Config).
    - The server-side credentials (`FIREBASE_*` variables) can be the same as your Google Service Account credentials if your Firebase project is linked to your Google Cloud project.

### 4. Running the Development Server

Once the environment variables are set, you can start the application:

```bash
npm run dev
```

This will start two services:
- The Next.js application, typically on `http://localhost:9002`.
- The Genkit development server for backend flows.

Open `http://localhost:9002` in your browser to see the application.
