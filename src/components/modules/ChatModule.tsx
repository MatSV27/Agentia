import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, PlusCircle, Calendar, TrendingUp, BarChart2 } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import API_CONFIG from "@/config/api";

// ---- DEBUGGING CODE START ----
// ESTE CÓDIGO ES SOLO PARA DEPURACIÓN Y DEBE SER ELIMINADO DESPUÉS
let originalObjectDescriptor: any = null;

const startNameAccessDebugging = () => {
  if (originalObjectDescriptor) return; // Ya iniciado

  const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, 'name');
  if (descriptor) {
    originalObjectDescriptor = descriptor;
    Object.defineProperty(Object.prototype, 'name', {
      get: function() {
        if (this === undefined || this === null) {
          console.error("DEBUG: Attempting to access 'name' on undefined or null");
          console.trace(); // ESTO NOS DARÁ LA PILA DE LLAMADAS
        }
        return originalObjectDescriptor.get?.call(this);
      },
      set: function(value) {
        return originalObjectDescriptor.set?.call(this, value);
      },
      configurable: true, // Importante para poder restaurarlo
    });
    console.log("DEBUG: 'name' access debugging started.");
  }
};

const stopNameAccessDebugging = () => {
  if (originalObjectDescriptor) {
    Object.defineProperty(Object.prototype, 'name', originalObjectDescriptor);
    originalObjectDescriptor = null;
    console.log("DEBUG: 'name' access debugging stopped.");
  }
};
// ---- DEBUGGING CODE END ----

// Tipo para mensajes
interface Message {
  role: "user" | "model";
  parts: string[];
}

// Interfaces para datos de usuario
interface Habit {
  id: number;
  name: string;
  frequency: string;
  category: {
    name: string;
    color: string;
  };
  current_streak: number;
  completed_today: boolean;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: string;
  date: string;
  category_name: string;
}

interface Event {
  id: number | string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  category: {
    name: string;
    color: string;
  };
}

// Datos de ejemplo para pruebas - se utilizarán si no hay conexión con el backend
const EXAMPLE_HABITS: Habit[] = [
  {
    id: 1,
    name: "Leer 20 minutos",
    frequency: "daily",
    category: { name: "Aprendizaje", color: "blue" },
    current_streak: 5,
    completed_today: true
  },
  {
    id: 2,
    name: "Hacer ejercicio",
    frequency: "weekly",
    category: { name: "Bienestar", color: "green" },
    current_streak: 2,
    completed_today: false
  },
  {
    id: 3,
    name: "Meditar",
    frequency: "daily",
    category: { name: "Bienestar", color: "purple" },
    current_streak: 0,
    completed_today: false
  }
];

const EXAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    amount: 500,
    description: "Supermercado",
    type: "gasto",
    date: "2023-07-10T14:30:00",
    category_name: "Comida"
  },
  {
    id: 2,
    amount: 1500,
    description: "Pago freelance",
    type: "ingreso",
    date: "2023-07-08T09:15:00",
    category_name: "Trabajo"
  },
  {
    id: 3,
    amount: 200,
    description: "Cine",
    type: "gasto",
    date: "2023-07-07T20:45:00",
    category_name: "Entretenimiento"
  }
];

const EXAMPLE_EVENTS: Event[] = [
  {
    id: 1,
    title: "Reunión de trabajo",
    start_datetime: "2023-07-11T10:00:00",
    end_datetime: "2023-07-11T11:30:00",
    category: { name: "Trabajo", color: "blue" }
  },
  {
    id: 2,
    title: "Gimnasio",
    start_datetime: "2023-07-11T17:00:00",
    end_datetime: "2023-07-11T18:30:00",
    category: { name: "Bienestar", color: "green" }
  }
];

// Tipo para sugerencia rápida
interface QuickAction {
  id: string;
  text: string;
  icon?: React.ReactNode;
}

const ChatModule = () => {
  // ---- DEBUGGING CODE HOOK ----
  useEffect(() => {
    startNameAccessDebugging();
    return () => {
      stopNameAccessDebugging();
    };
  }, []);
  // ---- DEBUGGING CODE HOOK END ----

  // Obtener el nombre de usuario del localStorage
  const userName = localStorage.getItem('userName') || 'Usuario';
  
  // Estados para el chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Estados para datos del usuario
  const [userData, setUserData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>({ total_income: 0, total_expense: 0, balance: 0 });
  const [events, setEvents] = useState<Event[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  
  // URL para el backend (relativa a la ubicación actual)
  const BACKEND_URL = "";
  
  // Función para obtener el token desde localStorage
  const getToken = () => localStorage.getItem("token");
  
  // Lista de acciones rápidas sugeridas
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    { id: "habits", text: "¿Qué hábitos debo completar hoy?", icon: <PlusCircle className="h-4 w-4" /> },
    { id: "events", text: "¿Cuál es mi próximo evento?", icon: <Calendar className="h-4 w-4" /> },
    { id: "finance", text: "¿Cómo van mis finanzas?", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "progress", text: "¿Cómo ha sido mi progreso?", icon: <BarChart2 className="h-4 w-4" /> }
  ]);
  
  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      // Inicializar datos de ejemplo por defecto
      const defaultUserData = {
        user: { name: userName },
        habits: EXAMPLE_HABITS,
        transactions: EXAMPLE_TRANSACTIONS,
        finance: {
          current_month_income: 1500,
          current_month_expenses: 700,
          balance: 800,
          savings_goals: []
        },
        events: EXAMPLE_EVENTS
      };
      
      try {
        console.log("Iniciando carga de datos del usuario...");
        const token = getToken();
        
        if (!token) {
          console.log("No hay token de autenticación, usando datos de ejemplo");
          // Usar los datos de ejemplo preestablecidos
          setUserData(defaultUserData);
          
          // Agregar un mensaje de bienvenida inicial
          setMessages([
            {
              role: "model",
              parts: [`¡Hola ${userName}! Estoy usando datos de ejemplo porque no estás autenticado o no se pudo contactar con el servidor. ¿En qué puedo ayudarte hoy?`]
            }
          ]);
          
          setUserDataLoaded(true);
          return;
        }
        
        try {
          // Usar el nuevo endpoint consolidado para obtener todos los datos del usuario
          console.log("Obteniendo datos del usuario desde el servidor...");
          const response = await axios.get(API_CONFIG.getApiUrl('/api/chatbot/user-data'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Respuesta del servidor recibida:", response.status);
          
          if (response.data && typeof response.data === 'object') {
            if (response.data.user && response.data.user.name) {
              console.log("Datos del usuario procesados correctamente del backend");
              setUserData(response.data); // Asumimos que response.data tiene la estructura { user: ..., categories: ..., etc. }
              setCategories(response.data.categories || []);
              setFinanceSummary(response.data.finance_summary || { total_income: 0, total_expense: 0, balance: 0 });
              setEvents(response.data.events || []);
              setHabits(response.data.habits || []);
            } else {
              console.error("Error: Respuesta JSON del backend no tiene la estructura esperada o user.name falta.", response.data);
              setUserData({ 
                user: { name: "Usuario (Error)", email: "error@example.com" }, 
                categories: EXAMPLE_HABITS.map(h => h.category), // Ejemplo
                finance_summary: { total_income: 0, total_expense: 0, balance: 0 },
                events: EXAMPLE_EVENTS,
                habits: EXAMPLE_HABITS 
              });
              console.error("Error de Datos: Usando datos de ejemplo estructurados debido a respuesta inesperada.");
            }
          } else {
            console.error("Error: La respuesta del backend no es un objeto JSON válido.", response.data);
            setUserData({ 
              user: { name: "Usuario (Fallo)", email: "fallo@example.com" },
              categories: EXAMPLE_HABITS.map(h => h.category),
              finance_summary: { total_income: 0, total_expense: 0, balance: 0 },
              events: EXAMPLE_EVENTS,
              habits: EXAMPLE_HABITS 
            });
            console.error("Error de Respuesta: Usando datos de ejemplo estructurados.");
          }
        } catch (error: any) {
          console.error("Error al comunicarse con el backend para obtener user-data:", error);
          setUserData(defaultUserData); // defaultUserData ya tiene la estructura correcta con .user
          setMessages([
            {
              role: "model",
              parts: [`¡Hola ${userName}! Parece que hay un problema de conexión con el servidor. Estoy usando datos de ejemplo. ¿En qué puedo ayudarte hoy?`]
            }
          ]);
        }
        
        setUserDataLoaded(true); // Asegurarse de que esto se llame
      } catch (error) {
        console.error("Error general al cargar datos del usuario:", error);
        
        // Usar datos de ejemplo en caso de error general
        setUserData(defaultUserData);
        
        // Mensaje de error con explicación clara
        setMessages([
          {
            role: "model",
            parts: [`¡Hola ${userName}! Ha ocurrido un error al inicializar el chat. Estoy usando datos de ejemplo para que podamos interactuar. Si este problema persiste, por favor contacta a soporte.`]
          }
        ]);
        
        setUserDataLoaded(true);
      }
    };
    
    fetchUserData();
  }, [userName]);
  
  // Función para crear un resumen de los datos del usuario
  const createUserDataContext = () => {
    if (!userData || !userData.user) return "No hay datos de usuario disponibles para generar el contexto.";
    
    // Asegurarnos que userData.user existe antes de acceder a sus propiedades
    const userNameToUse = userData.user?.name || 'Usuario';
    
    let context = `INFORMACIÓN DEL USUARIO ${userNameToUse.toUpperCase()}:\n\n`;
    
    // Información de hábitos
    context += "HÁBITOS:\n";
    if (userData.habits && userData.habits.length > 0) {
      userData.habits.forEach((habit: Habit) => {
        context += `- ${habit.name || 'Sin nombre'} (${habit.frequency || 'diario'}): ${habit.completed_today ? 'Completado hoy' : 'Pendiente'}, Racha actual: ${habit.current_streak || 0} días\n`;
      });
    } else {
      context += "No tiene hábitos registrados.\n";
    }
    
    // Información de finanzas
    context += "\nFINANZAS RECIENTES:\n";
    if (userData.finance) {
      const income = userData.finance.current_month_income || 0;
      const expenses = userData.finance.current_month_expenses || 0;
      const balance = userData.finance.balance || 0;
      
      context += `- Ingresos este mes: $${income.toFixed(2)}\n`;
      context += `- Gastos este mes: $${expenses.toFixed(2)}\n`;
      context += `- Balance actual: $${balance.toFixed(2)}\n`;
    } else {
      context += "No hay información financiera disponible.\n";
    }
    
    if (userData.transactions && userData.transactions.length > 0) {
      context += "\nÚLTIMAS TRANSACCIONES:\n";
      userData.transactions.slice(0, 5).forEach((tx: Transaction) => {
        try {
          const formattedDate = new Date(tx.date).toLocaleDateString();
          context += `- ${formattedDate}: ${tx.description || 'Sin descripción'}: ${tx.type === 'ingreso' ? '+' : '-'}$${tx.amount || 0} (${tx.category_name || 'Sin categoría'})\n`;
        } catch (e) {
          // Si hay algún error con el formato, usar un formato seguro
          context += `- Transacción: ${tx.description || 'Sin descripción'}: $${tx.amount || 0}\n`;
        }
      });
    }
    
    // Información de calendario
    context += "\nEVENTOS HOY:\n";
    if (userData.events && userData.events.length > 0) {
      userData.events.forEach((event: Event) => {
        try {
          const start = new Date(event.start_datetime);
          const end = new Date(event.end_datetime);
          const startTime = format(start, "HH:mm", { locale: es });
          const endTime = format(end, "HH:mm", { locale: es });
          context += `- ${event.title || 'Evento sin título'} (${startTime} - ${endTime}): ${event.category?.name || 'Sin categoría'}\n`;
        } catch (e) {
          // Si hay algún error con el formato, usar un formato seguro
          context += `- ${event.title || 'Evento sin título'}\n`;
        }
      });
    } else {
      context += "No tiene eventos programados para hoy.\n";
    }
    
    return context;
  };
  
  // Efecto para hacer scroll al último mensaje
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Al iniciar, mostrar un mensaje de bienvenida con contexto del usuario
  useEffect(() => {
    if (!userDataLoaded || !userData || !userData.user) return;
    
    try {
      // Crear contexto del usuario
      // const userContext = createUserDataContext(); // <--- TEMPORALMENTE COMENTADO
      
      const finalUserName = userData.user?.name || userName; // userName es del localStorage
      // Mensaje de bienvenida simplificado TEMPORALMENTE
      const welcomeMessage = `¡Hola ${finalUserName}! ¿Cómo puedo ayudarte hoy? (Contexto detallado temporalmente desactivado para depuración).`;
      
      /* const welcomeMessage = `¡Hola ${finalUserName}! Soy tu coach personal de AgentIA. ¿Cómo puedo ayudarte hoy? Puedo asistirte con tus hábitos, finanzas, calendario, o simplemente conversar sobre cómo va tu día.

Aquí tienes un resumen de tu información actual:

${userContext}

**Cosas que puedes pedirme:**
- Información sobre tus hábitos pendientes
- Análisis de tus finanzas y gastos
- Recordatorios de eventos próximos
- Consejos personalizados según tus datos
- Marcar hábitos como completados con "Completar hábito: [nombre]"

¿En qué puedo ayudarte hoy?`; */
      
      setMessages([
        {
          role: "model",
          parts: [welcomeMessage]
        }
      ]);
    } catch (error) {
      console.error("Error al generar mensaje de bienvenida:", error);
      
      // Mensaje de bienvenida simple sin contexto en caso de error
      setMessages([
        {
          role: "model",
          parts: [`¡Hola ${userName}! Soy tu coach personal de AgentIA. ¿Cómo puedo ayudarte hoy?`]
        }
      ]);
    }
  }, [userName, userDataLoaded, userData]);
  
  // Enviar mensaje
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Agregar mensaje del usuario a la conversación
    const userMessage = {
      role: "user" as const,
      parts: [inputMessage]
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      const token = getToken();
      
      // Crear una versión de conversation_history para la API
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));
      
      try {
        // Intentar enviar el mensaje al backend
        const response = await axios.post(
          API_CONFIG.getApiUrl('/api/chatbot/message'),
          {
            message: inputMessage,
            conversation_history: messageHistory
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Procesar la respuesta del backend
        if (response.data && response.data.response) {
          const modelResponse = {
            role: "model" as const,
            parts: [response.data.response]
          };
          
          setMessages((prev) => [...prev, modelResponse]);
        } else {
          throw new Error("Respuesta vacía del servidor");
        }
      } catch (error) {
        console.error("Error al comunicarse con el servidor para el chat:", error);
        
        // Respuesta ficticia para modo offline
        let offlineResponse = "Lo siento, no puedo conectarme al servidor en este momento. ";
        
        // Generar una respuesta basada en palabras clave del mensaje
        const lowerMsg = inputMessage.toLowerCase();
        
        if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días') || lowerMsg.includes('buenas')) {
          offlineResponse = `¡Hola ${userName}! Estoy en modo offline pero puedo ayudarte con información básica. ¿Qué necesitas?`;
        } 
        else if (lowerMsg.includes('hábit') || lowerMsg.includes('habit')) {
          offlineResponse = "Según los datos de ejemplo, tienes 3 hábitos: Leer 20 minutos (completado hoy), Hacer ejercicio (pendiente) y Meditar (pendiente).";
        }
        else if (lowerMsg.includes('finanz') || lowerMsg.includes('gast') || lowerMsg.includes('diner')) {
          offlineResponse = "Según los datos de ejemplo, tus ingresos son $1,500 y tus gastos $700, con un balance de $800. ¡Estás administrando bien tu dinero!";
        }
        else if (lowerMsg.includes('event') || lowerMsg.includes('cit') || lowerMsg.includes('reuni')) {
          offlineResponse = "Según los datos de ejemplo, hoy tienes una reunión de trabajo a las 10:00 y gimnasio a las 17:00.";
        }
        else if (lowerMsg.includes('progres') || lowerMsg.includes('avance')) {
          offlineResponse = "Según los datos de ejemplo, tu mejor hábito es 'Leer 20 minutos' con una racha de 5 días consecutivos. ¡Sigue así!";
        }
        else {
          offlineResponse = "Estoy en modo offline y no puedo procesar esa consulta ahora. Prueba a preguntar sobre tus hábitos, finanzas o eventos usando los datos de ejemplo.";
        }
        
        const modelResponse = {
          role: "model" as const,
          parts: [offlineResponse]
        };
        
        setMessages((prev) => [...prev, modelResponse]);
      }
    } catch (error) {
      console.error("Error general en sendMessage:", error);
      
      // Respuesta genérica en caso de error
      const modelResponse = {
        role: "model" as const,
        parts: ["Lo siento, ha ocurrido un error. Por favor, intenta de nuevo o recarga la página."]
      };
      
      setMessages((prev) => [...prev, modelResponse]);
    } finally {
      setIsLoading(false);
      
      // Scroll al último mensaje
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };
  
  // Manejar envío con Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Función para manejar una acción rápida
  const handleQuickAction = (action: QuickAction) => {
    setInputMessage(action.text);
    setIsLoading(true);
    
    // Crear el mensaje del usuario
    const userMessage: Message = {
      role: "user",
      parts: [action.text]
    };
    
    // Añadir mensaje del usuario y resetear el input
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Enviar el mensaje con el texto de la acción
    const sendQuickActionMessage = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          throw new Error("No estás autenticado. Por favor, inicia sesión para usar el chat.");
        }
        
        // Preparar los datos para la API incluyendo el nuevo mensaje
        const requestData = {
          message: action.text,
          conversation_history: [...messages, userMessage]
        };
        
        const response = await axios.post(API_CONFIG.getApiUrl('/api/chatbot/message'), requestData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200 && response.data && response.data.response) {
          const modelMessage: Message = {
            role: "model",
            parts: [response.data.response]
          };
          setMessages(prev => [...prev, modelMessage]);
        } else {
          throw new Error("La respuesta del servidor no contiene datos válidos");
        }
      } catch (error) {
        console.error("Error al enviar mensaje rápido:", error);
        
        let errorMessage: Message = {
          role: "model",
          parts: ["Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde."]
        };
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error("Detalles del error:", error.response.data);
            errorMessage.parts[0] = `Error ${error.response.status}: ${error.response.data.message || 'Error desconocido'}`;
          } else if (error.request) {
            console.error("No se recibió respuesta del servidor");
            errorMessage.parts[0] = "No se pudo conectar con el servidor. Por favor, verifica tu conexión.";
          }
        }
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    
    sendQuickActionMessage();
  };
  
  // Función para formatear el mensaje (convierte los enlaces y formatos de Markdown)
  const formatMessage = (content: string) => {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full border-green-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-green-800">
            Coach Personal
              </CardTitle>
          <CardDescription>
            Conversa con tu coach IA para avanzar en tus metas personales
          </CardDescription>
            </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-[65vh] px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {message.role === "model" && (
                      <Avatar className="h-8 w-8 bg-green-600 text-white">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="prose prose-sm break-words">
                        {formatMessage(message.parts[0])}
                      </div>
                      
                      {/* Mostrar sugerencias después del primer mensaje del modelo */}
                      {message.role === "model" && index === 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {quickActions.map((action) => (
                            <Badge
                              key={action.id}
                              variant="outline"
                              className="cursor-pointer bg-white hover:bg-green-50 transition-colors flex items-center gap-1 px-3 py-1.5 text-sm border-green-200 text-green-800"
                              onClick={() => handleQuickAction(action)}
                            >
                              {action.icon}
                              {action.text}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 bg-gray-300">
                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 bg-green-600 text-white">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-gray-100">
                      <div className="animate-pulse">
                        <div className="h-2 w-16 bg-gray-300 rounded mb-2"></div>
                        <div className="h-2 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Escribe un mensaje..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border-green-200 focus-visible:ring-green-500"
              disabled={isLoading}
                />
                <Button
              onClick={sendMessage} 
                  className="bg-green-600 hover:bg-green-700"
              disabled={isLoading || !inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
                </Button>
              </div>
        </CardFooter>
          </Card>
    </div>
  );
};

export default ChatModule;
