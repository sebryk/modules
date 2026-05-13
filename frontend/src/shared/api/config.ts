const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const getApiBaseUrl = () => import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL;

export { getApiBaseUrl };
