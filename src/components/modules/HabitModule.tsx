import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListCheck, PlusCircle, Check, Calendar, CalendarCheck, ArchiveIcon, Trash2, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitForm } from "@/components/habit/HabitForm";
import { HabitItem } from "@/components/habit/HabitItem";
import { HabitStats } from "@/components/habit/HabitStats";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import API_CONFIG from "@/config/api";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const HabitModule = () => {
  // Estados para los hábitos
  const [todayHabits, setTodayHabits] = useState<any[]>([]);
  const [allHabits, setAllHabits] = useState<any[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<any>(null);
  
  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Cargar hábitos al montar el componente
  useEffect(() => {
    loadHabits();
  }, []);
  
  // Función para cargar hábitos desde el backend
  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Cargar hábitos de hoy
      const todayResponse = await fetch(API_CONFIG.getApiUrl('/api/habits/today'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!todayResponse.ok) {
        throw new Error('Error al cargar hábitos de hoy');
      }
      
      // Cargar todos los hábitos activos
      const allResponse = await fetch(API_CONFIG.getApiUrl('/api/habits?status=active'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!allResponse.ok) {
        throw new Error('Error al cargar todos los hábitos');
      }
      
      // Cargar hábitos archivados
      const archivedResponse = await fetch(API_CONFIG.getApiUrl('/api/habits?status=archived'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!archivedResponse.ok) {
        throw new Error('Error al cargar hábitos archivados');
      }
      
      const todayData = await todayResponse.json();
      const allData = await allResponse.json();
      const archivedData = await archivedResponse.json();
      
      setTodayHabits(todayData);
      setAllHabits(allData);
      setArchivedHabits(archivedData);
    } catch (error) {
      console.error('Error al cargar hábitos:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para abrir el formulario de nuevo hábito
  const openHabitForm = (habit = null) => {
    setCurrentHabit(habit);
    setIsHabitFormOpen(true);
  };
  
  // Función para crear o actualizar un hábito
  const handleSubmitHabit = async (habitData: any) => {
    try {
      setLoading(true); // Mostrar indicador de carga
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const isEditing = !!currentHabit;
      const url = isEditing 
        ? API_CONFIG.getApiUrl(`/api/habits/${currentHabit.id}`) 
        : API_CONFIG.getApiUrl('/api/habits');
      
      const method = isEditing ? 'PUT' : 'POST';
      
      try {
        console.log(`Enviando solicitud ${method} a ${url}:`, habitData);
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(habitData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Respuesta del servidor:', response.status, errorText);
          throw new Error(`Error al ${isEditing ? 'actualizar' : 'crear'} hábito: ${response.statusText || 'Error en la respuesta del servidor'}`);
        }
        
        const data = await response.json();
        console.log('Respuesta exitosa:', data);
        
        toast({
          title: isEditing ? 'Hábito actualizado' : 'Hábito creado',
          description: isEditing 
            ? `Se actualizó el hábito "${data.name}" correctamente.`
            : `Se creó el hábito "${data.name}" correctamente.`,
        });
        
        // Recargar hábitos
        await loadHabits();
        
        // Cerrar el formulario
        setIsHabitFormOpen(false);
        setCurrentHabit(null);
      } catch (fetchError) {
        console.error('Error en la petición fetch:', fetchError);
        
        // Proporcionar mensajes de error más específicos
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error(`Error de conexión: No se puede conectar al servidor. Verifica que el servidor esté en ejecución.`);
        } else {
          throw new Error(`Error de conexión: ${fetchError instanceof Error ? fetchError.message : 'No se pudo conectar al servidor'}`);
        }
      }
    } catch (error) {
      console.error('Error al guardar hábito:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };
  
  // Función para eliminar un hábito
  const handleDeleteHabit = async (habitId: number) => {
    // Abrir diálogo de confirmación
    setHabitToDelete(habitId);
    setIsDeleteDialogOpen(true);
  };
  
  // Función para confirmar la eliminación de un hábito
  const confirmDeleteHabit = async () => {
    if (!habitToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/habits/${habitToDelete}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el hábito');
      }
      
      // Buscar el nombre del hábito eliminado para el mensaje
      const habitName = [...todayHabits, ...allHabits, ...archivedHabits]
        .find(h => h.id === habitToDelete)?.name || 'Hábito';
      
      toast({
        title: 'Hábito eliminado',
        description: `El hábito "${habitName}" ha sido eliminado permanentemente.`
      });
      
      // Recargar hábitos
      await loadHabits();
    } catch (error) {
      console.error('Error al eliminar hábito:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      // Cerrar diálogo y limpiar estado
      setIsDeleteDialogOpen(false);
      setHabitToDelete(null);
    }
  };
  
  // Función para completar un hábito
  const handleCompleteHabit = async (habitId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/habits/${habitId}/complete`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completion_date: new Date().toISOString().split('T')[0] })
      });
      
      if (!response.ok) {
        throw new Error('Error al completar hábito');
      }
      
      // Recargar hábitos
      await loadHabits();
      
      return true;
    } catch (error) {
      console.error('Error al completar hábito:', error);
      throw error;
    }
  };
  
  // Función para desmarcar un hábito
  const handleUncompleteHabit = async (habitId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/habits/${habitId}/uncomplete`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completion_date: new Date().toISOString().split('T')[0] })
      });
      
      if (!response.ok) {
        throw new Error('Error al desmarcar hábito');
      }
      
      // Recargar hábitos
      await loadHabits();
      
      return true;
    } catch (error) {
      console.error('Error al desmarcar hábito:', error);
      throw error;
    }
  };
  
  // Función para archivar/desarchivar un hábito
  const handleArchiveHabit = async (habitId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const habit = allHabits.find(h => h.id === habitId) || archivedHabits.find(h => h.id === habitId);
      const newStatus = habit?.status === 'active' ? 'archived' : 'active';
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/habits/${habitId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Error al ${newStatus === 'archived' ? 'archivar' : 'activar'} hábito`);
      }
      
      // Recargar hábitos
      await loadHabits();
      
      toast({
        title: newStatus === 'archived' ? 'Hábito archivado' : 'Hábito activado',
        description: `El hábito ha sido ${newStatus === 'archived' ? 'archivado' : 'activado'} correctamente.`
      });
    } catch (error) {
      console.error('Error al cambiar estado del hábito:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };
  
  // Formatear la fecha actual
  const formattedToday = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const capitalizedToday = formattedToday.charAt(0).toUpperCase() + formattedToday.slice(1);
  
  // Renderizar el componente
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Registro de Hábitos</h2>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => openHabitForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo hábito
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="bg-green-100 text-green-700 mb-6">
          <TabsTrigger value="active" className="flex items-center gap-1">
            <CalendarCheck className="h-4 w-4" /> Activos
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <ListCheck className="h-4 w-4" /> Estadísticas
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-1">
            <ArchiveIcon className="h-4 w-4" /> Archivados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex justify-center">
                  <span className="text-green-700">Cargando hábitos...</span>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-6">
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                  <p>{error}</p>
                  <Button variant="outline" className="mt-2" onClick={loadHabits}>
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Hábitos de hoy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Hábitos de hoy
              </CardTitle>
                  <CardDescription>{capitalizedToday}</CardDescription>
            </CardHeader>
            <CardContent>
                  {todayHabits.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No tienes hábitos programados para hoy.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4 border-green-200 text-green-700"
                        onClick={() => openHabitForm()}
                      >
                        Crear un nuevo hábito
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayHabits.map((habit) => (
                        <HabitItem
                          key={habit.id}
                          habit={habit}
                          onComplete={handleCompleteHabit}
                          onUncomplete={handleUncompleteHabit}
                          onEdit={openHabitForm}
                          onArchive={handleArchiveHabit}
                          onDelete={handleDeleteHabit}
                        />
                      ))}
                    </div>
                  )}
            </CardContent>
          </Card>
          
              {/* Progreso adaptativo según frecuencia */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                      <CardTitle>Progreso</CardTitle>
                      <CardDescription>Seguimiento de tus hábitos según su frecuencia</CardDescription>
                </CardHeader>
                <CardContent>
                      {allHabits.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">Todavía no tienes hábitos activos.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4 border-green-200 text-green-700"
                            onClick={() => openHabitForm()}
                          >
                            Crear tu primer hábito
                          </Button>
                        </div>
                      ) : (
                  <div className="space-y-6">
                          {allHabits.map((habit) => {
                            // Calcular el progreso (cuántos días completados / programados)
                            const weekProgress = habit.week_progress || [];
                            const progressPercentage = weekProgress.length > 0
                              ? (weekProgress.filter(Boolean).length / weekProgress.length) * 100
                              : 0;
                            
                            // Determinar si es mensual para mostrar visualización diferente
                            const isMonthly = habit.frequency === 'monthly';
                            
                            return (
                      <div key={habit.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span 
                                      className={`inline-block w-2 h-2 rounded-full bg-${habit.category.color || 'green'}-500`}
                                    />
                          <span className="font-medium">{habit.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {habit.frequency === 'daily' ? 'Diario' : 
                                       habit.frequency === 'weekly' ? 'Semanal' : 'Mensual'}
                                    </span>
                                    <span className="text-sm text-green-700">{progressPercentage.toFixed(0)}%</span>
                                  </div>
                                </div>
                                <Progress 
                                  value={progressPercentage} 
                                  className="h-2 bg-green-100" 
                                  style={{
                                    '--tw-progress-fill': `var(--${habit.category.color || 'green'})`
                                  } as React.CSSProperties}
                                />
                                
                                {/* Mostrar días del mes para hábitos mensuales */}
                                {isMonthly ? (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-2">
                                      Días programados: {habit.days_of_month?.join(', ')}
                                    </p>
                                    <div className="grid grid-cols-7 gap-1">
                                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                                        // Convertir el día a string para comparar con days_of_month
                                        const dayStr = day.toString();
                                        const isDayInMonth = habit.days_of_month?.includes(dayStr);
                                        
                                        // Verificar si el día ha sido completado este mes
                                        const currentDate = new Date();
                                        const currentMonth = currentDate.getMonth();
                                        const currentYear = currentDate.getFullYear();
                                        
                                        // Crear fecha para el día que estamos evaluando en el mes actual
                                        const checkDate = new Date(currentYear, currentMonth, day);
                                        
                                        // Solo considerar días hasta la fecha actual
                                        const isPastDay = checkDate <= currentDate;
                                        
                                        // Ver si ha sido completado (usando week_progress como referencia temporal)
                                        // En una implementación real, deberíamos tener datos de completado mensual
                                        const isCompleted = isDayInMonth && isPastDay && 
                                          weekProgress[Math.min(6, day % 7)]; // Usar week_progress para simular completado
                                        
                                        return (
                                          <div 
                                            key={day}
                                            className={`text-center py-1 rounded-sm text-xs ${
                                              !isDayInMonth 
                                                ? "text-gray-300" 
                                                : isCompleted
                                                  ? "bg-green-100 text-green-700 font-medium"
                                                  : isPastDay 
                                                    ? "bg-gray-100 text-gray-500"
                                                    : "bg-gray-50 text-gray-400"
                                            }`}
                                          >
                                            {day}
                                          </div>
                                        );
                                      })}
                                    </div>
                        </div>
                                ) : (
                                  // Mostrar días de la semana para hábitos diarios y semanales
                        <div className="flex justify-between mt-2">
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => (
                            <div 
                              key={idx}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                          weekProgress[idx]
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                                )}
                      </div>
                            );
                          })}
                  </div>
                      )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListCheck className="h-5 w-5 text-green-600" />
                        Todos tus hábitos
                  </CardTitle>
                      <CardDescription>Vista general</CardDescription>
                </CardHeader>
                <CardContent>
                      {allHabits.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">Todavía no tienes hábitos.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {allHabits.map((habit) => (
                            <div key={habit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                              <div className="flex items-center gap-2">
                                <span 
                                  className={`inline-block w-2 h-2 rounded-full bg-${habit.category.color || 'green'}-500`}
                                />
                                <span className="text-sm font-medium">{habit.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{habit.current_streak} días</span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 border-blue-200 text-blue-700"
                                  onClick={() => openHabitForm(habit)}
                                  title="Editar hábito"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 border-amber-200 text-amber-700"
                                  onClick={() => handleArchiveHabit(habit.id)}
                                  title="Archivar hábito"
                                >
                                  <ArchiveIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 border-red-200 text-red-700"
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  title="Eliminar hábito"
                                >
                                  <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      </div>
                    ))}
                  </div>
                      )}
                </CardContent>
              </Card>
            </div>
          </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          {loading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex justify-center">
                  <span className="text-green-700">Cargando estadísticas...</span>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
          <Card>
            <CardContent className="py-6">
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                  <p>{error}</p>
                  <Button variant="outline" className="mt-2" onClick={loadHabits}>
                    Reintentar
                  </Button>
              </div>
            </CardContent>
          </Card>
          ) : (
            <HabitStats habits={allHabits} />
          )}
        </TabsContent>
        
        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <CardTitle>Hábitos archivados</CardTitle>
              <CardDescription>Hábitos que has completado o pausado</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-6 text-center">
                  <span className="text-green-700">Cargando hábitos archivados...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                  <p>{error}</p>
                  <Button variant="outline" className="mt-2" onClick={loadHabits}>
                    Reintentar
                  </Button>
                </div>
              ) : archivedHabits.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No tienes hábitos archivados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {archivedHabits.map((habit) => (
                    <div 
                      key={habit.id}
                      className="p-3 rounded flex items-center justify-between bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <ArchiveIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{habit.name}</p>
                          <div className="flex items-center gap-2">
                            <span 
                              className={`inline-block w-2 h-2 rounded-full bg-${habit.category.color || 'green'}-300`}
                            />
                            <p className="text-xs text-muted-foreground">
                              {habit.category.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700"
                          onClick={() => handleArchiveHabit(habit.id)}
                        >
                          Reactivar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-700"
                          onClick={() => openHabitForm(habit)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Formulario para crear/editar hábitos */}
      <HabitForm
        isOpen={isHabitFormOpen}
        onClose={() => {
          setIsHabitFormOpen(false);
          setCurrentHabit(null);
        }}
        onSubmit={handleSubmitHabit}
        initialData={currentHabit}
      />
      
      {/* Diálogo de confirmación para eliminar hábito */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el hábito y su historial de completados.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHabit} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HabitModule;
