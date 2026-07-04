import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const data = err.response?.data;

    if (!data) {
      if (err.code === 'ERR_NETWORK') {
        return 'No se pudo conectar con el servidor. ¿Está corriendo el backend en localhost:8080?';
      }
      return fallback;
    }

    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object') {
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.message === 'string') return data.message;
    }

    if (err.response?.status === 401) {
      return 'Credenciales incorrectas o sesión expirada.';
    }
    if (err.response?.status === 403) {
      return 'No tienes permiso para realizar esta acción.';
    }
  }
  return fallback;
}
