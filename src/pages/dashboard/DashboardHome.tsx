import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Check, DollarSign, Heart, ListCheck } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import API_CONFIG from "@/config/api";

const DashboardHome = () => {
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayDate, setTodayDate] = useState("");
  
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
        console.log("No hay token de autenticación");
        setLoading(false);
        return;
      }
      
      // Usar el endpoint consolidado del chatbot para obtener todos los datos
      const response = await axios.get(API_CONFIG.getApiUrl('/api/chatbot/user-data'), {
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

  // Calcular el progreso total de hábitos completados hoy
  const getHabitsProgress = () => {
    if (!userData || !userData.habits || userData.habits.length === 0) return 0;
    const completedCount = userData.habits.filter((h: any) => h.completed_today).length;
    return Math.round((completedCount / userData.habits.length) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Resumen de hábitos */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ListCheck className="h-5 w-5 text-green-600" />
            Hábitos
          </CardTitle>
          <CardDescription>Progreso de hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress 
              value={loading ? 0 : getHabitsProgress()} 
              className="h-2 bg-green-100" 
            />
            <p className="text-sm text-gray-500">
              {loading ? "Cargando hábitos..." : 
                userData && userData.habits ? (
                  `${userData.habits.filter((h: any) => h.completed_today).length} de ${userData.habits.length} completados`
                ) : "No hay hábitos registrados"
              }
            </p>
            
            {/* Lista de hábitos */}
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-gray-400">Cargando...</p>
              ) : (
                userData && userData.habits && userData.habits.length > 0 ? (
                  userData.habits.slice(0, 3).map((habit: any) => (
                    <div key={habit.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${habit.completed_today ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm">{habit.name}</span>
                      </div>
                      <span className={`text-xs font-medium ${habit.completed_today ? 'text-green-600' : 'text-gray-400'}`}>
                        {habit.completed_today ? 'Completado' : 'Pendiente'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No hay hábitos para mostrar</p>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resumen financiero */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Finanzas
          </CardTitle>
          <CardDescription>Resumen del mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos financieros...</p>
            ) : (
              userData && userData.finance_summary ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Balance:</span>
                    <span className="font-medium">${userData.finance_summary.balance?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Ingresos:</span>
                    <span className="text-green-600">${userData.finance_summary.total_income?.toFixed(2) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Gastos:</span>
                    <span className="text-red-600">${userData.finance_summary.total_expense?.toFixed(2) || 0}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No hay información financiera disponible</p>
              )
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Calendario / Eventos */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Eventos
          </CardTitle>
          <CardDescription>Próximos eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400">Cargando eventos...</p>
            ) : (
              userData && userData.events && userData.events.length > 0 ? (
                userData.events.slice(0, 3).map((event: any) => {
                  const startDate = new Date(event.start_datetime);
                  return (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-800 rounded w-12 h-12 flex flex-col items-center justify-center">
                        <span className="text-xs font-semibold">{startDate.toLocaleString('es-ES', { month: 'short' })}</span>
                        <span className="text-lg font-bold">{startDate.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">No hay eventos próximos</p>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome; 