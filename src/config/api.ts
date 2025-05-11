// Configuración de la API
// Siempre usar la URL de Cloud Run
const baseUrl = 'https://agentia-flask-api-986748001268.us-central1.run.app';

console.log(`Base URL: ${baseUrl}`);

// Función para obtener el token de autenticación del localStorage
const getToken = () => localStorage.getItem('token');

const API_CONFIG = {
  getApiUrl: (path: string) => `${baseUrl}${path}`,
  apiBaseUrl: `${baseUrl}/api`,
  geminiApiUrl: `${baseUrl}/api/chatbot/message`,
  fetchApi: async (path: string, options: any = {}) => {
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
    
    // Obtener el token de autenticación
    const token = getToken();
    
    // Preparar los headers con el token si existe
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
    return response.json();
  }
};

export default API_CONFIG; 