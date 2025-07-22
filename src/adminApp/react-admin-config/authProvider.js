// Auth provider for react-admin v5
// This should integrate with the existing Avni authentication system

export const authProvider = {
  login: () => {
    // Authentication is handled by the main app's authentication system
    // React-admin components don't directly handle login in this app
    return Promise.resolve();
  },

  logout: () => {
    // Logout is handled by LogoutButton component and main app's logout flow
    return Promise.resolve();
  },

  checkAuth: () => {
    // Check if user is authenticated by verifying the auth session in app state
    // This will be managed by the main app's authentication flow
    return Promise.resolve();
  },

  checkError: error => {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    // Permissions are handled by the main app's user info and roles system
    return Promise.resolve();
  }
};
