
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, Settings, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WellbeingModule = () => {
  // Example data for wellbeing module
  const wellbeingActivities = [
    { 
      id: 1, 
      name: "Descanso visual", 
      description: "Regla 20-20-20: cada 20 min, mira algo a 20 pies por 20 seg",
      nextReminder: "10 minutos",
      icon: "👁️"
    },
    { 
      id: 2, 
      name: "Postura correcta", 
      description: "Recordatorio para mantener la espalda recta y hombros relajados",
      nextReminder: "25 minutos",
      icon: "⬆️"
    },
    { 
      id: 3, 
      name: "Hidratación", 
      description: "Recuerda beber agua regularmente durante el día",
      nextReminder: "35 minutos",
      icon: "💧"
    },
    { 
      id: 4, 
      name: "Pausa activa", 
      description: "Ejercicios breves para estirar el cuerpo",
      nextReminder: "50 minutos",
      icon: "🤸"
    },
  ];
  
  const moodHistory = [
    { day: "Lun", mood: "😊", value: 5 },
    { day: "Mar", mood: "😌", value: 4 },
    { day: "Mié", mood: "😊", value: 5 },
    { day: "Jue", mood: "😐", value: 3 },
    { day: "Vie", mood: "😌", value: 4 },
    { day: "Sáb", mood: "😊", value: 5 },
    { day: "Dom", mood: "😊", value: 5 },
  ];
  
  const breathingExercises = [
    { name: "Respiración 4-7-8", duration: "2 min", benefit: "Reduce ansiedad" },
    { name: "Respiración cuadrada", duration: "3 min", benefit: "Mejora concentración" },
    { name: "Respiración profunda", duration: "1 min", benefit: "Calma rápida" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Bienestar Personal</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <Settings className="mr-2 h-4 w-4" /> Configurar recordatorios
        </Button>
      </div>
      
      {/* Active reminders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Recordatorios activos
          </CardTitle>
          <CardDescription>Ajustados a tu horario de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wellbeingActivities.map((activity) => (
              <div 
                key={activity.id}
                className="p-4 rounded border border-green-100 bg-green-50 flex items-start gap-4"
              >
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{activity.name}</h3>
                  <p className="text-sm text-green-700 mt-1">{activity.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-green-600">Próximo: {activity.nextReminder}</span>
                    <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700">
                      <Check className="h-3 w-3 mr-1" /> Hecho
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Wellbeing stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado emocional semanal</CardTitle>
              <CardDescription>Registro de tu bienestar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mood chart */}
                <div className="h-64 flex items-end justify-between gap-2 pt-6">
                  {moodHistory.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <div 
                        className="w-full bg-green-100 rounded-t"
                        style={{ height: `${day.value * 12}%` }}
                      ></div>
                      <div className="text-xl">{day.mood}</div>
                      <div className="text-xs font-medium">{day.day}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Análisis de bienestar</h3>
                  <p className="text-sm text-green-700">
                    Tu estado de ánimo ha sido positivo esta semana. Mantén los buenos hábitos
                    de descanso y pausas activas que has estado practicando.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                Ejercicios de respiración
              </CardTitle>
              <CardDescription>Para momentos de estrés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breathingExercises.map((exercise, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                        {exercise.duration}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mb-2">{exercise.benefit}</p>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      Iniciar ejercicio
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estadísticas de descanso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pausas visuales</span>
                    <span className="font-medium">12/15</span>
                  </div>
                  <Progress value={80} className="h-2 bg-green-100" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pausas activas</span>
                    <span className="font-medium">7/10</span>
                  </div>
                  <Progress value={70} className="h-2 bg-green-100" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Recordatorios de postura</span>
                    <span className="font-medium">15/15</span>
                  </div>
                  <Progress value={100} className="h-2 bg-green-100" />
                </div>
                
                <div className="bg-green-50 border border-green-100 p-3 rounded">
                  <p className="text-sm text-green-700">
                    Has mejorado un 15% en tomar descansos visuales
                    comparado con la semana pasada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick wellbeing tips */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos de bienestar</CardTitle>
          <CardDescription>Pequeños cambios, grandes impactos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Ergonomía</h3>
              <p className="text-sm text-green-700">
                Ajusta la altura de tu pantalla al nivel de los ojos 
                para reducir la tensión en el cuello.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Hidratación</h3>
              <p className="text-sm text-green-700">
                Mantén una botella de agua visible en tu escritorio
                como recordatorio para beber regularmente.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Luz natural</h3>
              <p className="text-sm text-green-700">
                Trabajar cerca de una ventana con luz natural puede
                mejorar tu estado de ánimo y productividad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellbeingModule;
