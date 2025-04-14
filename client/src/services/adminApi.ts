export const adminApi = {
  getWriters: async () => {
    const response = await fetch('/api/admin/writers', {
      credentials: 'include'
    });
    handleAuthError(response);
    return response.json();
  },
  // Add other CRUD methods
};

const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }
};