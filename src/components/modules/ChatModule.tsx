
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Calendar, ListCheck, Heart, DollarSign, Check } from "lucide-react";

type MessageType = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  options?: {
    text: string;
    action: string;
    icon?: JSX.Element;
  }[];
};

const ChatModule = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 1,
      text: "¡Hola Alexandra! ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage: MessageType = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue.toLowerCase());
      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const generateBotResponse = (userInput: string): MessageType => {
    const id = messages.length + 2;

    // Handle different user inputs with appropriate responses
    if (userInput.includes("disponibilidad") || userInput.includes("libre") || userInput.includes("agenda")) {
      return {
        id,
        text: "Veo que tienes dos bloques libres hoy: 11:30 AM - 12:30 PM y 3:15 - 4:00 PM. ¿Te gustaría programar alguna actividad en estos horarios?",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { 
            text: "Usar bloque de 11:30 AM", 
            action: "schedule_morning", 
            icon: <Calendar className="h-4 w-4" /> 
          },
          { 
            text: "Usar bloque de 3:15 PM", 
            action: "schedule_afternoon", 
            icon: <Calendar className="h-4 w-4" /> 
          },
          { 
            text: "No, gracias", 
            action: "dismiss" 
          },
        ],
      };
    } else if (userInput.includes("hábito") || userInput.includes("habito") || userInput.includes("rutina")) {
      return {
        id,
        text: "Basado en tus metas actuales, te recomendaría añadir un hábito de lectura diaria o práctica de guitarra. ¿Cuál te gustaría añadir a tu rutina?",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { 
            text: "Añadir lectura diaria", 
            action: "add_reading_habit", 
            icon: <ListCheck className="h-4 w-4" /> 
          },
          { 
            text: "Añadir práctica de guitarra", 
            action: "add_guitar_habit", 
            icon: <ListCheck className="h-4 w-4" /> 
          },
          { 
            text: "Ninguno por ahora", 
            action: "dismiss" 
          },
        ],
      };
    } else if (userInput.includes("dinero") || userInput.includes("gasto") || userInput.includes("finanza")) {
      return {
        id,
        text: "Analizando tus gastos recientes, he notado que gastas un 25% más en comida a domicilio que el mes pasado. Si reduces esto, podrías ahorrar aproximadamente $200 este mes. ¿Quieres establecer un límite de gasto para esta categoría?",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { 
            text: "Establecer límite", 
            action: "set_spending_limit", 
            icon: <DollarSign className="h-4 w-4" /> 
          },
          { 
            text: "Ver detalle de gastos", 
            action: "view_expenses", 
            icon: <DollarSign className="h-4 w-4" /> 
          },
          { 
            text: "No, gracias", 
            action: "dismiss" 
          },
        ],
      };
    } else if (userInput.includes("me siento") || userInput.includes("ánimo") || userInput.includes("animo") || userInput.includes("sentir")) {
      return {
        id,
        text: "¿Cómo te sientes hoy? Tu bienestar es importante para planificar mejor tu día.",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { text: "😊 Muy bien", action: "feeling_great", icon: <Heart className="h-4 w-4" /> },
          { text: "😌 Bien", action: "feeling_good" },
          { text: "😐 Normal", action: "feeling_neutral" },
          { text: "😓 Cansado/a", action: "feeling_tired" },
          { text: "😢 Mal", action: "feeling_bad" },
        ],
      };
    } else if (userInput.includes("gracias")) {
      return {
        id,
        text: "¡De nada! Estoy aquí para ayudarte a organizar tu día de la mejor manera posible. ¿Hay algo más en lo que pueda asistirte?",
        sender: "bot",
        timestamp: new Date(),
      };
    } else {
      return {
        id,
        text: "¿En qué más puedo ayudarte hoy? Puedo ayudarte a gestionar tu calendario, tus hábitos, finanzas o bienestar personal.",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { 
            text: "Ver mi disponibilidad", 
            action: "check_availability", 
            icon: <Calendar className="h-4 w-4" /> 
          },
          { 
            text: "Sugerir nuevo hábito", 
            action: "suggest_habit", 
            icon: <ListCheck className="h-4 w-4" /> 
          },
          { 
            text: "Analizar mis finanzas", 
            action: "analyze_finances", 
            icon: <DollarSign className="h-4 w-4" /> 
          },
          { 
            text: "Registrar cómo me siento", 
            action: "log_feeling", 
            icon: <Heart className="h-4 w-4" /> 
          },
        ],
      };
    }
  };

  const handleOptionClick = (option: { text: string; action: string }) => {
    // Add the option as a user message
    const newMessage: MessageType = {
      id: messages.length + 1,
      text: option.text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Generate appropriate response based on the option selected
    setTimeout(() => {
      let botResponse: MessageType;

      switch (option.action) {
        case "schedule_morning":
          botResponse = {
            id: messages.length + 2,
            text: "Excelente, he reservado el bloque de 11:30 AM - 12:30 PM. ¿Qué actividad te gustaría programar en este horario?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Práctica de guitarra", action: "schedule_guitar" },
              { text: "Revisar metas semanales", action: "schedule_goals" },
              { text: "Tiempo para leer", action: "schedule_reading" },
            ],
          };
          break;
        case "schedule_afternoon":
          botResponse = {
            id: messages.length + 2,
            text: "Perfecto, he reservado el bloque de 3:15 - 4:00 PM. ¿Qué actividad te gustaría programar?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Práctica de guitarra", action: "schedule_guitar" },
              { text: "Revisar metas semanales", action: "schedule_goals" },
              { text: "Tiempo para leer", action: "schedule_reading" },
            ],
          };
          break;
        case "schedule_guitar":
        case "schedule_goals":
        case "schedule_reading":
          botResponse = {
            id: messages.length + 2,
            text: `¡Listo! He programado la actividad en tu calendario. ¿Te gustaría que te envíe un recordatorio 15 minutos antes?`,
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, por favor", action: "set_reminder", icon: <Check className="h-4 w-4" /> },
              { text: "No es necesario", action: "no_reminder" },
            ],
          };
          break;
        case "set_reminder":
          botResponse = {
            id: messages.length + 2,
            text: "Recordatorio configurado. Te avisaré 15 minutos antes de la actividad.",
            sender: "bot",
            timestamp: new Date(),
          };
          break;
        case "add_reading_habit":
          botResponse = {
            id: messages.length + 2,
            text: "He añadido 'Leer 15 minutos' a tus hábitos diarios. ¿En qué momento del día prefieres realizarlo?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Por la mañana", action: "morning_habit" },
              { text: "Durante el almuerzo", action: "lunch_habit" },
              { text: "Por la noche", action: "evening_habit" },
            ],
          };
          break;
        case "add_guitar_habit":
          botResponse = {
            id: messages.length + 2,
            text: "He añadido 'Practicar guitarra' a tus hábitos. ¿Cuántas veces por semana te gustaría practicar?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "3 veces por semana", action: "guitar_3_times" },
              { text: "5 veces por semana", action: "guitar_5_times" },
              { text: "Diariamente", action: "guitar_daily" },
            ],
          };
          break;
        case "set_spending_limit":
          botResponse = {
            id: messages.length + 2,
            text: "He establecido un límite de $150 para gastos en comida a domicilio este mes. Te avisaré cuando te acerques a este límite. ¿Te parece bien esta cantidad?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, perfecto", action: "confirm_limit" },
              { text: "Ajustar límite", action: "adjust_limit" },
            ],
          };
          break;
        case "feeling_great":
        case "feeling_good":
          botResponse = {
            id: messages.length + 2,
            text: "¡Qué bueno saberlo! Con este nivel de energía, es un buen momento para avanzar en tus metas más desafiantes. ¿Quieres que te sugiera algunas actividades?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, por favor", action: "suggest_challenging_tasks" },
              { text: "No por ahora", action: "dismiss" },
            ],
          };
          break;
        case "feeling_neutral":
          botResponse = {
            id: messages.length + 2,
            text: "Entiendo. Para días así, es bueno mantener un equilibrio entre tareas necesarias y momentos de descanso. ¿Quieres que ajuste tu agenda para incluir pequeñas pausas?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, añade pausas", action: "add_breaks" },
              { text: "No es necesario", action: "dismiss" },
            ],
          };
          break;
        case "feeling_tired":
        case "feeling_bad":
          botResponse = {
            id: messages.length + 2,
            text: "Lamento que no te sientas bien hoy. ¿Te gustaría que reprogramemos algunas tareas no urgentes para darte más espacio?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, por favor", action: "reschedule_tasks" },
              { text: "Sugerir actividad relajante", action: "suggest_relaxation" },
              { text: "No, seguiré con mi agenda", action: "dismiss" },
            ],
          };
          break;
        case "dismiss":
        default:
          botResponse = {
            id: messages.length + 2,
            text: "Entendido. ¿Hay algo más en lo que pueda ayudarte hoy?",
            sender: "bot",
            timestamp: new Date(),
          };
          break;
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 800);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Coach Diario</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Conversación con tu asistente
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto mb-4 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.sender === "user"
                          ? "bg-green-600 text-white"
                          : "bg-green-50 border border-green-100 text-green-900"
                      }`}
                    >
                      <p>{message.text}</p>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                      {message.options && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.options.map((option, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={message.sender === "user" ? "secondary" : "outline"}
                              className="text-xs flex items-center gap-1 bg-white text-green-700 border-green-200"
                              onClick={() => handleOptionClick(option)}
                            >
                              {option.icon && option.icon}
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sugerencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700"
                  onClick={() => {
                    setInputValue("¿Cuál es mi disponibilidad hoy?");
                    handleSendMessage();
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  ¿Cuál es mi disponibilidad hoy?
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700"
                  onClick={() => {
                    setInputValue("Recomiéndame un nuevo hábito");
                    handleSendMessage();
                  }}
                >
                  <ListCheck className="h-4 w-4 mr-2" />
                  Recomiéndame un nuevo hábito
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700"
                  onClick={() => {
                    setInputValue("Analiza mis finanzas");
                    handleSendMessage();
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Analiza mis finanzas
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700"
                  onClick={() => {
                    setInputValue("Así me siento hoy");
                    handleSendMessage();
                  }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Así me siento hoy
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Recordatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Descanso visual</p>
                  <p className="text-xs text-green-600">En 5 minutos</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Revisar finanzas</p>
                  <p className="text-xs text-green-600">5:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;
