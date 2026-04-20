// Token and authentication helper functions

export const checkTokenExpiration = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < exp;
  } catch {
    return false;
  }
};

export const handleAuthError = (router: any) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login?expired=true');
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};



