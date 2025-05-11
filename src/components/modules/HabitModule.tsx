
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListCheck, PlusCircle, Check, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HabitModule = () => {
  // Example data for habits
  const habits = [
    { 
      id: 1, 
      name: "Leer 15 minutos",
      category: "Aprendizaje", 
      streak: 4, 
      totalDays: 7,
      progress: 57,
      schedule: "Diario", 
      completed: true,
      weekProgress: [true, true, true, true, false, false, false]
    },
    { 
      id: 2, 
      name: "Meditar 5 minutos",
      category: "Bienestar", 
      streak: 0, 
      totalDays: 7,
      progress: 14,
      schedule: "Diario", 
      completed: false,
      weekProgress: [false, true, false, false, false, false, false]
    },
    { 
      id: 3, 
      name: "Practicar guitarra",
      category: "Hobby", 
      streak: 2, 
      totalDays: 3,
      progress: 67,
      schedule: "Lun-Mié-Vie", 
      completed: true,
      weekProgress: [true, false, true, false, false, false, false]
    },
    { 
      id: 4, 
      name: "Escribir en diario",
      category: "Reflexión", 
      streak: 6, 
      totalDays: 7,
      progress: 86,
      schedule: "Diario", 
      completed: true,
      weekProgress: [true, true, true, true, true, true, false]
    },
  ];
  
  const recommendedHabits = [
    { name: "Estiramientos matutinos", category: "Salud", duration: "5 min" },
    { name: "Repasar vocabulario", category: "Idiomas", duration: "10 min" },
    { name: "Planificar el día", category: "Productividad", duration: "5 min" },
  ];
  
  const insights = [
    "Tienes mejor consistencia con hábitos matutinos.",
    "Has mejorado un 15% en completar tus hábitos de aprendizaje.",
    "Tus días más productivos son los martes y jueves."
  ];
  
  const days = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Registro de Hábitos</h2>
        <Button className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo hábito
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="bg-green-100 text-green-700 mb-6">
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="archive">Archivados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {/* Today's habits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Hábitos de hoy
              </CardTitle>
              <CardDescription>Miércoles, 11 de mayo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.map((habit) => (
                  <div 
                    key={habit.id}
                    className={`p-3 rounded flex items-center justify-between ${
                      habit.completed ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          habit.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {habit.category} • {habit.schedule}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{habit.streak}</div>
                        <div className="text-xs text-muted-foreground">Racha</div>
                      </div>
                      
                      {!habit.completed && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Progreso semanal</CardTitle>
                  <CardDescription>Historial de esta semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {habits.map((habit) => (
                      <div key={habit.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{habit.name}</span>
                          <span className="text-sm text-green-700">{habit.progress}%</span>
                        </div>
                        <Progress value={habit.progress} className="h-2 bg-green-100" />
                        <div className="flex justify-between mt-2">
                          {days.map((day, idx) => (
                            <div 
                              key={idx}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                habit.weekProgress[idx]
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListCheck className="h-5 w-5 text-green-600" />
                    Recomendaciones
                  </CardTitle>
                  <CardDescription>Basado en tus objetivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendedHabits.map((habit, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium">{habit.name}</p>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                            {habit.duration}
                          </span>
                        </div>
                        <p className="text-xs text-green-700">{habit.category}</p>
                        <Button size="sm" variant="outline" className="w-full mt-2 border-green-200 text-green-700">
                          Añadir a mis hábitos
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Insights</CardTitle>
                  <CardDescription>Análisis de tus hábitos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                        <p className="text-sm text-green-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center h-64 text-green-700">
                Aquí irían las estadísticas detalladas de tus hábitos con gráficas de progreso
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archive">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center h-64 text-green-700">
                Aquí irían tus hábitos archivados o completados
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HabitModule;
