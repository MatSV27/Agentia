import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Check, 
  DollarSign, 
  Heart, 
  ListCheck, 
  MessageSquare, 
  PlusCircle, 
  Settings,
  TrendingUp, 
  Leaf,
  LogOut,
  User,
  BarChart2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FinanceModule from "@/components/modules/FinanceModule";
import HabitModule from "@/components/modules/HabitModule";
import WellbeingModule from "@/components/modules/WellbeingModule";
import CalendarModule from "@/components/modules/CalendarModule";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

// Interfaces para datos
interface Habit {
  id: number;
  name: string;
  current_streak: number;
  completed_today: boolean;
  category: {
    name: string;
    color: string;
  };
}

interface Event {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  is_habit?: boolean;
  completed?: boolean;
  category: {
    name: string;
    color: string;
  };
}

interface FinanceSummary {
  balance_total: number;
  gastos_mes: number;
  ingresos_mes: number;
  categorias: any[];
  metas_ahorro: {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
  }[];
}

interface UserData {
  user: {
    name: string;
    email: string;
  };
  habits: Habit[];
  events: Event[];
  finance: FinanceSummary;
  transactions: any[];
}

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para almacenar datos del usuario
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayDate, setTodayDate] = useState("");
  
  // Obtener el nombre del usuario del almacenamiento local
  const userName = localStorage.getItem('userName') || 'Usuario';
  
  // Cargar datos del usuario al inicio
  useEffect(() => {
    fetchUserData();
    
    // Obtener la fecha actual formateada
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    setTodayDate(now.toLocaleDateString('es-ES', options));
  }, []);
  
  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No hay token de autenticación, redirigiendo a login");
        navigate('/login');
        return;
      }
      
      // Usar el endpoint consolidado del chatbot para obtener todos los datos
      const response = await axios.get('/api/chatbot/user-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus datos. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    // Eliminar el token y el nombre del usuario al cerrar sesión
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/");
  };

  // Calcular cuántos eventos/bloques libres tiene hoy
  const getAvailableBlocks = () => {
    if (!userData || !userData.events) return 0;
    
    // Contar eventos que no son hábitos (son bloques libres)
    return userData.events.filter(event => !event.is_habit).length;
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation header */}
      <header className="py-4 bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold seed-icon">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">AgentIA</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Settings className="mr-1 h-4 w-4" /> 
              Configuración
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  {userName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Greeting section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Hola, {userName}! 👋</h1>
          <p className="text-gray-600">
            Hoy tienes {loading ? "..." : getAvailableBlocks()} bloques disponibles para avanzar en tus metas 🌱
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setSelectedTab("calendar")}>
            <Calendar className="mr-2 h-4 w-4" /> Planear mi día
          </Button>
          <Link to="/bot">
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" /> Hablar con AgentIA
            </Button>
          </Link>
          
          {/* Botón directo para el chatbot integrado */}
          <Link to="/dashboard/bot">
            <Button className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" /> Chat en Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="bg-green-100 text-green-700">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="finance">Finanzas</TabsTrigger>
            <TabsTrigger value="habits">Hábitos</TabsTrigger>
            <TabsTrigger value="wellbeing">Bienestar</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Calendar preview */}
              <div className="md:col-span-2">
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Tu día de hoy
                    </CardTitle>
                    <CardDescription>{todayDate}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        <p className="text-sm text-gray-500">Cargando eventos...</p>
                      ) : userData && userData.events && userData.events.length > 0 ? (
                        // Mostrar eventos reales
                        userData.events.map(event => {
                          // Formatear horario
                          const start = new Date(event.start_datetime);
                          const end = new Date(event.end_datetime);
                          const timeStr = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`;
                          
                          if (event.is_habit) {
                            // Es un hábito
                            return (
                              <div key={event.id} className="p-3 rounded bg-green-50 border border-green-100 flex items-center">
                                <div className={`w-1 h-12 bg-${event.completed ? "green-600" : "green-400"} rounded-full mr-3`} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{event.title}</p>
                                  <p className="text-xs text-gray-500">{timeStr}</p>
                                </div>
                                <div>
                                  {event.completed ? (
                                    <Button size="sm" variant="ghost" className="h-8 text-green-600">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          } else {
                            // Es un evento normal
                            return (
                              <div key={event.id} className="p-3 rounded bg-green-50 border border-green-100 flex items-center">
                                <div className="w-1 h-12 bg-green-600 rounded-full mr-3" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{event.title}</p>
                                  <p className="text-xs text-gray-500">{timeStr}</p>
                                </div>
                              </div>
                            );
                          }
                        })
                      ) : (
                        // Si no hay eventos
                        <div className="p-3 rounded bg-green-50/50 border border-dashed border-green-300 flex items-center">
                          <div className="w-1 h-12 bg-green-300 rounded-full mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-700">Bloque libre disponible</p>
                            <p className="text-xs text-gray-500">No tienes eventos programados para hoy</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300" 
                                  onClick={() => setSelectedTab("calendar")}>
                            <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right column - Quick widgets */}
              <div className="space-y-6">
                {/* Finance widget */}
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Resumen Financiero
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {loading ? (
                        <p className="text-sm text-gray-500">Cargando datos financieros...</p>
                      ) : userData && userData.finance ? (
                        <>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Presupuesto mensual</span>
                              {/* Calcular % de presupuesto usado */}
                              <span className="font-medium">
                                {Math.min(Math.round((userData.finance.gastos_mes / (userData.finance.ingresos_mes || 1)) * 100), 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(Math.round((userData.finance.gastos_mes / (userData.finance.ingresos_mes || 1)) * 100), 100)} 
                              className="h-2 bg-green-100"
                            />
                          </div>
                          <p className="text-sm text-green-600 mt-2">
                            Balance: ${userData.finance.ingresos_mes - userData.finance.gastos_mes}
                          </p>
                          <Button size="sm" variant="outline" className="w-full mt-2 text-green-700 border-green-300"
                                 onClick={() => setSelectedTab("finance")}>
                            Ver finanzas
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No hay datos financieros disponibles</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Habit widget */}
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ListCheck className="h-5 w-5 text-green-600" />
                      Hábitos de Hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loading ? (
                        <p className="text-sm text-gray-500">Cargando hábitos...</p>
                      ) : userData && userData.habits && userData.habits.length > 0 ? (
                        // Mostrar hábitos reales
                        userData.habits.slice(0, 3).map(habit => (
                          <div key={habit.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full ${habit.completed_today ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center`}>
                                <Check className="h-4 w-4" />
                              </div>
                              <span className="text-sm">{habit.name}</span>
                            </div>
                            <span className={`text-xs ${habit.current_streak > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded`}>
                              {habit.current_streak > 0 ? `Racha: ${habit.current_streak} días` : 'Sin racha'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tienes hábitos programados para hoy</p>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-2 text-green-700 border-green-300"
                             onClick={() => setSelectedTab("habits")}>
                        Ver todos los hábitos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Emotional state widget */}
                <Card className="border-green-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5 text-green-600" />
                      ¿Cómo te sientes hoy?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center gap-2 mb-3">
                      {["😊", "😌", "😐", "😓", "😢"].map(emoji => (
                        <Button 
                          key={emoji} 
                          variant={emoji === "😌" ? "default" : "outline"} 
                          className={`text-xl h-10 w-10 p-0 rounded-full ${emoji === "😌" ? "bg-green-600" : "border-green-200"}`}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-green-600 italic">"Cada pequeño paso cuenta. ¡Sigues mejorando cada día!"</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Module insights row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <TrendingUp className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Progreso financiero</h3>
                      <p className="text-sm text-green-700">Ahorraste 15% más que el mes pasado.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <ListCheck className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Hábitos efectivos</h3>
                      <p className="text-sm text-green-700">Racha de 7 días en lectura. ¡Sigue así!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <Heart className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Bienestar</h3>
                      <p className="text-sm text-green-700">Recuerda hacer una pausa visual en 10 min.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <Calendar className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Calendario</h3>
                      <p className="text-sm text-green-700">2 bloques libres hoy para tus metas.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="finance">
            <FinanceModule />
          </TabsContent>
          
          <TabsContent value="habits">
            <HabitModule />
          </TabsContent>
          
          <TabsContent value="wellbeing">
            <WellbeingModule />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
