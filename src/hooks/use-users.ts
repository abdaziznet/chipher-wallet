
'use client';
// This file is obsolete since user management has been moved to Firebase Authentication.
// It is kept to prevent breaking imports in the short term but should be deleted.
export function useUsers() {
  return {
    users: [],
    setUsers: () => {},
    currentUser: null,
    setCurrentUserId: () => {},
    isLoaded: true,
  };
}
