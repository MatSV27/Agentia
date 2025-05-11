import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, CheckCircle, Calendar, Award, TrendingUp } from "lucide-react";

interface HabitStatsProps {
  habits: any[];
}

export function HabitStats({ habits }: HabitStatsProps) {
  const [statsData, setStatsData] = useState({
    totalHabits: 0,
    completedToday: 0,
    completionRate: 0,
    maxStreak: 0,
    currentStreaks: 0,
    categoryBreakdown: [] as { name: string; count: number; }[],
    weeklyHeatmap: [] as boolean[][]
  });
  
  // Días de la semana
  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  
  // Categorías de hábitos
  const categories = [
    { name: 'Bienestar', color: 'green' },
    { name: 'Aprendizaje', color: 'blue' },
    { name: 'Reflexión', color: 'teal' },
    { name: 'Hobby', color: 'orange' },
    { name: 'Recreación', color: 'indigo' },
    { name: 'Relajación', color: 'purple' }
  ];
  
  // Procesar los datos de hábitos para las estadísticas
  useEffect(() => {
    if (!habits.length) return;
    
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completed_today).length;
    const completionRate = habits.filter(h => h.scheduled_today).length > 0 
      ? (completedToday / habits.filter(h => h.scheduled_today).length) * 100 
      : 0;
    
    // Encontrar la racha máxima
    const maxStreak = Math.max(...habits.map(h => h.current_streak));
    
    // Promedio de rachas actuales
    const currentStreaks = habits.reduce((acc, h) => acc + h.current_streak, 0) / totalHabits;
    
    // Desglose por categoría
    const categoryCount: Record<string, number> = {};
    habits.forEach(habit => {
      const catName = habit.category.name;
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });
    
    const categoryBreakdown = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count
    }));
    
    // Crear mapa de calor semanal (4 semanas x 7 días)
    // Este es un ejemplo simulado, en una implementación real 
    // esto vendría de datos históricos de la API
    const weeklyHeatmap = Array(4).fill(0).map(() => 
      Array(7).fill(0).map(() => Math.random() > 0.3)
    );
    
    setStatsData({
      totalHabits,
      completedToday,
      completionRate,
      maxStreak,
      currentStreaks,
      categoryBreakdown,
      weeklyHeatmap
    });
  }, [habits]);
  
  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Completados hoy</span>
              </div>
              <span className="text-2xl font-bold">{statsData.completedToday} / {statsData.totalHabits}</span>
              <span className="text-xs text-green-600 mt-1">
                {statsData.completionRate.toFixed(0)}% de tasa de completado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Racha máxima</span>
              </div>
              <span className="text-2xl font-bold">{statsData.maxStreak} días</span>
              <span className="text-xs text-green-600 mt-1">
                Promedio: {statsData.currentStreaks.toFixed(1)} días
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Consistencia</span>
              </div>
              <span className="text-2xl font-bold">4 semanas</span>
              <span className="text-xs text-green-600 mt-1">
                25 días activos en el último mes
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Progreso</span>
              </div>
              <span className="text-2xl font-bold">+15%</span>
              <span className="text-xs text-green-600 mt-1">
                Mejora vs. mes anterior
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos y análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mapa de calor de hábitos</CardTitle>
            <CardDescription>Actividad de las últimas 4 semanas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Heatmap semanal */}
              <div>
                <div className="flex justify-between mb-3">
                  {daysOfWeek.map((day, i) => (
                    <div key={i} className="w-8 text-center">
                      <span className="text-xs font-medium">{day}</span>
                    </div>
                  ))}
                </div>
                
                {statsData.weeklyHeatmap.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex justify-between mb-2">
                    {week.map((active, dayIndex) => (
                      <div 
                        key={dayIndex}
                        className={`w-8 h-8 rounded-sm ${
                          active 
                            ? "bg-green-200 border border-green-300" 
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                ))}
                
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm" />
                  <span className="text-xs text-gray-500 mr-3">Inactivo</span>
                  
                  <div className="w-3 h-3 bg-green-200 border border-green-300 rounded-sm" />
                  <span className="text-xs text-gray-500">Activo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución por categoría</CardTitle>
            <CardDescription>Tus tipos de hábitos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const stats = statsData.categoryBreakdown.find(c => c.name === category.name);
                const count = stats?.count || 0;
                const percentage = statsData.totalHabits > 0 
                  ? (count / statsData.totalHabits) * 100 
                  : 0;
                
                return (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`} />
                        <span>{category.name}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      style={{
                        background: 'rgba(229, 231, 235, 0.5)',
                        '--tw-progress-fill': `var(--${category.color})`
                      } as React.CSSProperties}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-3">Mejor momento del día</h4>
              
              <div className="space-y-3">
                <div className="p-2 rounded-md bg-green-50 border border-green-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Mañana</span>
                    <span className="text-sm font-medium text-green-800">68%</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">Mayor tasa de completado antes del mediodía</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 