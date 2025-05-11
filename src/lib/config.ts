// Importar nuestro API_CONFIG
import API_CONFIG from "@/config/api";

// Configuración global para la aplicación
const config = {
  // Función para obtener la URL correcta de la API
  getApiUrl: (path: string) => API_CONFIG.getApiUrl(path),
  
  // URL base para la API (compatible con código antiguo)
  apiBaseUrl: '/api', // Usará el proxy configurado en vite.config.ts
  
  // URL para la API de Gemini (relativa al proxy)
  geminiApiUrl: '/api/chatbot/message'
};

export default config; 