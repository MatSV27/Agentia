
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Calendar, ListCheck, Heart, DollarSign, Check, Leaf } from "lucide-react";

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
      text: "¡Hola Alexandra! Soy tu coach personal. ¿Cómo te sientes hoy?",
      sender: "bot",
      timestamp: new Date(),
      options: [
        { text: "Bien, listo para avanzar.", action: "ready_to_advance" },
        { text: "Necesito ayuda para organizar mi día.", action: "organize_day" },
        { text: "¿Cómo puedo mejorar mis hábitos hoy?", action: "improve_habits" },
        { text: "Revisemos mis finanzas.", action: "review_finances" },
      ],
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
        text: "¿Quieres registrar algún gasto hoy?",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { 
            text: "Sí, registrar un gasto", 
            action: "register_expense", 
            icon: <DollarSign className="h-4 w-4" /> 
          },
          { 
            text: "Ver mis estadísticas de gastos", 
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
    } else if (userInput.includes("meta") || userInput.includes("objetivo")) {
      return {
        id,
        text: "¿Tienes alguna meta en mente para hoy? Por ejemplo, 'Leer 30 minutos' o 'Meditar 10 minutos'.",
        sender: "bot",
        timestamp: new Date(),
        options: [
          { text: "Leer 30 minutos", action: "add_reading_goal" },
          { text: "Meditar 10 minutos", action: "add_meditation_goal" },
          { text: "Ejercicio 20 minutos", action: "add_exercise_goal" },
          { text: "Otra meta", action: "custom_goal" },
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
        case "ready_to_advance":
          botResponse = {
            id: messages.length + 2,
            text: "¡Genial! ¿Quieres que revisemos tu agenda para hoy o prefieres enfocarte en alguna meta específica?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Revisar agenda", action: "check_availability", icon: <Calendar className="h-4 w-4" /> },
              { text: "Establecer nueva meta", action: "set_goal", icon: <ListCheck className="h-4 w-4" /> },
            ],
          };
          break;
        
        case "organize_day":
          botResponse = {
            id: messages.length + 2,
            text: "Puedo ayudarte con eso. Veo que tienes dos bloques libres hoy: 11:30 AM - 12:30 PM y 3:15 - 4:00 PM. ¿Te gustaría programar alguna actividad en estos horarios?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Usar bloque de 11:30 AM", action: "schedule_morning", icon: <Calendar className="h-4 w-4" /> },
              { text: "Usar bloque de 3:15 PM", action: "schedule_afternoon", icon: <Calendar className="h-4 w-4" /> },
              { text: "Ver todas mis tareas pendientes", action: "view_tasks" },
            ],
          };
          break;
        
        case "improve_habits":
          botResponse = {
            id: messages.length + 2,
            text: "¿Cómo te fue con tu hábito de lectura ayer?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Lo completé", action: "habit_completed" },
              { text: "No lo hice", action: "habit_missed" },
              { text: "Quiero añadir un nuevo hábito", action: "add_new_habit" },
            ],
          };
          break;
          
        case "review_finances":
          botResponse = {
            id: messages.length + 2,
            text: "Tu gasto total esta semana ha sido de S/150. ¡Lo bueno es que todavía puedes ahorrar un 10% esta semana! ¿Te gustaría revisar tus categorías y ver dónde puedes ajustar?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, ver categorías", action: "view_expense_categories" },
              { text: "Registrar un nuevo gasto", action: "register_expense" },
              { text: "No, está bien por ahora", action: "dismiss" },
            ],
          };
          break;
          
        case "register_expense":
          botResponse = {
            id: messages.length + 2,
            text: "¿Cuánto gastaste y en qué categoría?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "S/50 en comida", action: "expense_food" },
              { text: "S/30 en transporte", action: "expense_transport" },
              { text: "S/100 en entretenimiento", action: "expense_entertainment" },
              { text: "Otro monto/categoría", action: "custom_expense" },
            ],
          };
          break;
          
        case "expense_food":
          botResponse = {
            id: messages.length + 2,
            text: "¡Perfecto! ¿Te gustaría añadir este gasto a tu categoría 'Comida' o crear una nueva categoría?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Añadir a Comida", action: "add_to_food_category" },
              { text: "Crear nueva categoría", action: "create_new_category" },
            ],
          };
          break;
          
        case "add_to_food_category":
          botResponse = {
            id: messages.length + 2,
            text: "He registrado el gasto de S/50. ¿Te gustaría ahorrar en esta categoría la próxima semana? Si necesitas recomendaciones, solo dime.",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, dame recomendaciones", action: "saving_recommendations" },
              { text: "No, gracias", action: "dismiss" },
            ],
          };
          break;
          
        case "saving_recommendations":
          botResponse = {
            id: messages.length + 2,
            text: "Aquí tienes algunas recomendaciones para ahorrar en comida:\n\n1. Planifica tus comidas semanalmente\n2. Cocina en lotes\n3. Aprovecha ofertas en supermercados\n4. Limita las comidas a domicilio a una vez por semana\n\n¿Te gustaría que te ayude a establecer un presupuesto semanal para comida?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, establece un presupuesto", action: "set_food_budget" },
              { text: "No, gracias", action: "dismiss" },
            ],
          };
          break;
        
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
          
        case "habit_missed":
          botResponse = {
            id: messages.length + 2,
            text: "No pasa nada, todos tenemos días difíciles. ¿Te gustaría hacer algo pequeño hoy para retomarlo?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, quiero intentarlo hoy", action: "retry_habit_today" },
              { text: "No, quiero hablar de otro hábito", action: "discuss_other_habit" },
            ],
          };
          break;
          
        case "retry_habit_today":
          botResponse = {
            id: messages.length + 2,
            text: "¡Genial actitud! ¿Qué te parece si empezamos con solo 5 minutos de lectura hoy? A veces dar el primer paso es lo más importante.",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, 5 minutos suena bien", action: "schedule_mini_habit" },
              { text: "Prefiero intentar los 15 minutos completos", action: "schedule_full_habit" },
            ],
          };
          break;
          
        case "habit_completed":
          botResponse = {
            id: messages.length + 2,
            text: "¡Felicidades! Tu racha de hábitos sigue en 6 días. ¡Vamos a por el séptimo! ¿Te gustaría que analicemos cómo mejorar aún más este hábito?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, quiero optimizarlo", action: "optimize_habit" },
              { text: "No, estoy conforme con mi progreso", action: "maintain_habit" },
            ],
          };
          break;
          
        case "add_reading_goal":
          botResponse = {
            id: messages.length + 2,
            text: "¡Genial! He añadido 'Leer 30 minutos' a tus metas de hoy. ¿Te gustaría que te sugiera un momento del día para hacerlo?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, ¿cuándo debería hacerlo?", action: "suggest_reading_time" },
              { text: "No, yo decidiré", action: "self_schedule" },
            ],
          };
          break;
          
        case "suggest_reading_time":
          botResponse = {
            id: messages.length + 2,
            text: "Basado en tus horarios anteriores, parece que podrías hacerlo a las 7 p.m., cuando tienes más tiempo libre. ¿Te parece bien?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, perfecto", action: "confirm_reading_time" },
              { text: "No, prefiero otro horario", action: "change_reading_time" },
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
        case "suggest_relaxation":
          botResponse = {
            id: messages.length + 2,
            text: "Veo que estás trabajando duro hoy. ¿Te gustaría tomar un descanso para cuidar tu vista? Toma 30 segundos para parpadear 20 veces, luego mira algo a lo lejos.",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, lo haré", action: "do_eye_rest" },
              { text: "No, estoy bien por ahora", action: "dismiss" },
            ],
          };
          break;
        case "do_eye_rest":
          botResponse = {
            id: messages.length + 2,
            text: "¡Excelente! Tomar estos pequeños descansos mejora tu productividad y salud a largo plazo. ¿Te gustaría que configure recordatorios periódicos para estos descansos?",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Sí, cada hora", action: "set_hourly_breaks" },
              { text: "Sí, cada dos horas", action: "set_two_hour_breaks" },
              { text: "No, gracias", action: "dismiss" },
            ],
          };
          break;
        case "view_expense_categories":
          botResponse = {
            id: messages.length + 2,
            text: "Aquí están tus categorías de gastos de esta semana:\n\n🍔 Comida: S/80\n🚌 Transporte: S/35\n🎬 Entretenimiento: S/25\n📱 Servicios: S/10\n\nDonde podrías ahorrar más es en la categoría de comida, reduciendo pedidos a domicilio.",
            sender: "bot",
            timestamp: new Date(),
            options: [
              { text: "Mostrar consejos de ahorro", action: "saving_tips" },
              { text: "Comparar con semana anterior", action: "compare_expenses" },
              { text: "Volver", action: "dismiss" },
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
            options: [
              { text: "Ver mi disponibilidad", action: "check_availability", icon: <Calendar className="h-4 w-4" /> },
              { text: "Sugerir nuevo hábito", action: "suggest_habit", icon: <ListCheck className="h-4 w-4" /> },
              { text: "Analizar mis finanzas", action: "analyze_finances", icon: <DollarSign className="h-4 w-4" /> },
              { text: "Registrar cómo me siento", action: "log_feeling", icon: <Heart className="h-4 w-4" /> },
            ],
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
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-green-600" /> Coach Personal
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col shadow-sm border-green-100">
            <CardHeader className="pb-2 border-b border-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                  <Leaf className="h-4 w-4" />
                </div>
                Conversación con AgentIA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden pt-4">
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
                              className="text-xs flex items-center gap-1 bg-white text-green-700 border-green-200 hover:bg-green-50"
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
                  className="flex-1 border-green-200 focus:border-green-400"
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
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-green-800">Sugerencias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700 hover:bg-green-50"
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
                  className="w-full justify-start text-left border-green-200 text-green-700 hover:bg-green-50"
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
                  className="w-full justify-start text-left border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => {
                    setInputValue("Registrar un gasto");
                    handleSendMessage();
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar un gasto
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-green-200 text-green-700 hover:bg-green-50"
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
          
          <Card className="mt-6 border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-green-800">Recordatorios</CardTitle>
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
