import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, PlusCircle, ListCheck, Heart, DollarSign, Check, Trash2, Edit } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import { format, parseISO, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import API_CONFIG from "@/config/api";

// Tipo para categorías de eventos
interface EventCategory {
  id: number;
  name: string;
  color: string;
}

// Tipo para eventos
interface Event {
  id: string | number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  is_all_day: boolean;
  category: {
    name: string;
    color: string;
  };
  category_id: number;
  is_habit?: boolean;
  google_event_id?: string;
}

// Tipo para bloques libres
interface FreeBlock {
  id: number;
  start_time: string;
  end_time: string;
  duration: number; // en minutos
}

const CalendarModule = () => {
  // Estado para la fecha seleccionada
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Estados para datos
  const [events, setEvents] = useState<Event[]>([]);
  const [freeBlocks, setFreeBlocks] = useState<FreeBlock[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  
  // Estados para diálogo de nuevo evento
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Estados para formulario de evento
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    category_id: "",
    start_datetime: "",
    end_datetime: "",
    location: "",
    is_all_day: false
  });
  
  // Función para obtener el token desde localStorage
  const getToken = () => localStorage.getItem("token");
  
  // Función para formatear fecha y hora
  const formatDateTime = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "HH:mm", { locale: es });
    } catch (e) {
      return dateStr;
    }
  };
  
  // Función para formatear fecha completa
  const formatFullDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };
  
  // Cargar categorías de eventos
  useEffect(() => {
    const fetchEventCategories = async () => {
      try {
        const token = getToken();
        if (!token) return;
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/events/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEventCategories(response.data);
      } catch (error) {
        console.error("Error al cargar categorías de eventos:", error);
      }
    };
    
    fetchEventCategories();
  }, []);
  
  // Cargar eventos del día seleccionado
  useEffect(() => {
    const fetchEventsForDay = async () => {
      if (!date) return;
      
      try {
        const token = getToken();
        if (!token) return;
        
        const dateStr = format(date, "yyyy-MM-dd");
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/events/day?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEvents(response.data);
        
        // Calcular bloques libres basados en los eventos
        calculateFreeBlocks(response.data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      }
    };
    
    fetchEventsForDay();
  }, [date]);
  
  // Función para calcular bloques libres
  const calculateFreeBlocks = (dayEvents: Event[]) => {
    if (!dayEvents.length) {
      // Si no hay eventos, considerar todo el día como libre (9am - 7pm)
      setFreeBlocks([
    { 
      id: 1, 
          start_time: "09:00",
          end_time: "19:00",
          duration: 600
        }
      ]);
      return;
    }
    
    // Ordenar eventos por hora de inicio
    const sortedEvents = [...dayEvents].sort((a, b) => 
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    );
    
    // Horas de trabajo estándar (9am - 7pm)
    const workDayStart = new Date(date!);
    workDayStart.setHours(9, 0, 0);
    
    const workDayEnd = new Date(date!);
    workDayEnd.setHours(19, 0, 0);
    
    const blocks: FreeBlock[] = [];
    let blockId = 1;
    let lastEndTime = workDayStart;
    
    // Encontrar huecos entre eventos
    for (const event of sortedEvents) {
      const eventStart = new Date(event.start_datetime);
      
      // Si hay un hueco entre el fin del último evento y el inicio de este
      if (eventStart.getTime() > lastEndTime.getTime() + 15 * 60 * 1000) { // 15 min mínimo
        const durationMinutes = Math.floor((eventStart.getTime() - lastEndTime.getTime()) / (60 * 1000));
        
        blocks.push({
          id: blockId++,
          start_time: format(lastEndTime, "HH:mm"),
          end_time: format(eventStart, "HH:mm"),
          duration: durationMinutes
        });
      }
      
      const eventEnd = new Date(event.end_datetime);
      if (eventEnd > lastEndTime) {
        lastEndTime = eventEnd;
      }
    }
    
    // Verificar si hay un hueco después del último evento hasta el fin del día
    if (lastEndTime.getTime() < workDayEnd.getTime() - 15 * 60 * 1000) {
      const durationMinutes = Math.floor((workDayEnd.getTime() - lastEndTime.getTime()) / (60 * 1000));
      
      blocks.push({
        id: blockId++,
        start_time: format(lastEndTime, "HH:mm"),
        end_time: format(workDayEnd, "HH:mm"),
        duration: durationMinutes
      });
    }
    
    setFreeBlocks(blocks);
  };
  
  // Función para abrir diálogo de nuevo evento
  const openNewEventDialog = () => {
    // Inicializar con valores por defecto
    setEventForm({
      title: "",
      description: "",
      category_id: "",
      start_datetime: `${format(date!, "yyyy-MM-dd")}T09:00`,
      end_datetime: `${format(date!, "yyyy-MM-dd")}T10:00`,
      location: "",
      is_all_day: false
    });
    setEditingEvent(null);
    setShowEventDialog(true);
  };
  
  // Función para abrir diálogo de edición de evento
  const openEditEventDialog = (event: Event) => {
    // No editar hábitos
    if (event.is_habit) return;
    
    setEventForm({
      title: event.title,
      description: event.description,
      category_id: event.category_id.toString(),
      start_datetime: event.start_datetime.substring(0, 16), // Formato YYYY-MM-DDTHH:MM
      end_datetime: event.end_datetime.substring(0, 16),
      location: event.location || "",
      is_all_day: event.is_all_day
    });
    setEditingEvent(event);
    setShowEventDialog(true);
  };
  
  // Manejador de cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejador para cambios en Select
  const handleSelectChange = (value: string, name: string) => {
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejador para cambios en Switch
  const handleSwitchChange = (checked: boolean, name: string) => {
    setEventForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Función para guardar evento
  const saveEvent = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const eventData = {
        ...eventForm,
        category_id: parseInt(eventForm.category_id)
      };
      
      if (editingEvent) {
        // Actualizar evento existente
        await axios.put(`${API_CONFIG.BASE_URL}/events/${editingEvent.id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Crear nuevo evento
        await axios.post(`${API_CONFIG.BASE_URL}/events`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Recargar eventos
      const dateStr = format(date!, "yyyy-MM-dd");
      const response = await axios.get(`${API_CONFIG.BASE_URL}/events/day?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvents(response.data);
      calculateFreeBlocks(response.data);
      
      // Cerrar diálogo
      setShowEventDialog(false);
    } catch (error) {
      console.error("Error al guardar evento:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };
  
  // Función para eliminar evento
  const deleteEvent = async (eventId: string | number) => {
    if (typeof eventId === 'string' && eventId.startsWith('habit_')) {
      // No permitir eliminar hábitos desde el calendario
      return;
    }
    
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    
    try {
      const token = getToken();
      if (!token) return;
      
      await axios.delete(`${API_CONFIG.BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizar lista de eventos
      setEvents(prev => prev.filter(e => e.id !== eventId));
      
      // Recalcular bloques libres
      calculateFreeBlocks(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Error al eliminar evento:", error);
    }
  };
  
  // Función para sincronizar con Google Calendar
  const syncWithGoogleCalendar = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/calendar/google/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.message);
    } catch (error) {
      console.error("Error al sincronizar con Google Calendar:", error);
      alert("Error al sincronizar con Google Calendar");
    }
  };
  
  // Obtener recomendaciones de hábitos para bloques libres
  const recommendations = [
    { id: 1, title: "Práctica de guitarra", time: "11:30 - 12:00", type: "habit" },
    { id: 2, title: "Revisar metas semanales", time: "15:15 - 15:45", type: "planning" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Calendario Inteligente</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-200 text-green-700" onClick={syncWithGoogleCalendar}>
            <CalendarIcon className="mr-2 h-4 w-4" /> Sincronizar Google Calendar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={openNewEventDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo evento
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar widget */}
        <div>
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventCategories.map(category => (
                  <div key={category.id} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-${category.color}-600`}></div>
                    <span className="text-sm">{category.name}</span>
                </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                  <span className="text-sm">Bloques libres</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Daily schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Agenda del día</CardTitle>
                <CardDescription>{date ? formatFullDate(date) : ""}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-green-200 text-green-700">
                  Día
                </Button>
                <Button variant="ghost" size="sm">
                  Semana
                </Button>
                <Button variant="ghost" size="sm">
                  Mes
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline */}
                <div className="relative pl-8 border-l border-green-100">
                  {events.length > 0 ? (
                    events.map((event) => (
                    <div key={event.id} className="mb-6 relative">
                      <div className="absolute -left-10 mt-1.5">
                          <div className={`w-5 h-5 rounded-full bg-${event.category.color}-600`}></div>
                      </div>
                      <div className="p-4 rounded border border-green-100 bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {`${formatDateTime(event.start_datetime)} - ${formatDateTime(event.end_datetime)}`}
                              </p>
                              {event.location && (
                                <p className="text-xs text-muted-foreground">{event.location}</p>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              {event.is_habit && <ListCheck className="h-4 w-4 text-green-600" />}
                              {event.category.name === "Bienestar" && <Heart className="h-4 w-4 text-purple-600" />}
                              {event.category.name === "Finanzas" && <DollarSign className="h-4 w-4 text-yellow-600" />}
                              
                              {!event.is_habit && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => openEditEventDialog(event)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => deleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                          </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No hay eventos programados para este día
                    </div>
                  )}
                </div>
                
                {/* Free blocks */}
                {freeBlocks.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Bloques libres disponibles</CardTitle>
                    <CardDescription>Tiempo para avanzar en tus metas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {freeBlocks.map((block) => (
                        <div key={block.id} className="flex justify-between items-center p-3 border border-dashed border-green-300 rounded bg-green-50/50">
                            <span className="font-medium text-green-800">
                              {`${block.start_time} - ${block.end_time}`}
                              <span className="ml-2 text-sm text-gray-500">
                                ({Math.floor(block.duration / 60)}h {block.duration % 60}min)
                              </span>
                            </span>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={openNewEventDialog}>
                            <PlusCircle className="h-4 w-4 mr-1" /> Planificar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}
                
                {/* Recommendations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recomendaciones para hoy</CardTitle>
                    <CardDescription>Basado en tus metas y calendario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{rec.title}</h4>
                              <p className="text-xs text-muted-foreground">Sugerido: {rec.time}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-green-200 text-green-700">
                                Reprogramar
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Check className="h-4 w-4 mr-1" /> Aceptar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Diálogo de creación/edición de evento */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar evento" : "Nuevo evento"}</DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? "Actualiza los detalles del evento existente" 
                : "Crea un nuevo evento en tu calendario"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                name="title"
                value={eventForm.title}
                onChange={handleFormChange}
                className="col-span-3"
                placeholder="Título del evento"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_id" className="text-right">
                Categoría
              </Label>
              <Select 
                value={eventForm.category_id} 
                onValueChange={(value) => handleSelectChange(value, "category_id")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_all_day" className="text-right">
                Todo el día
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="is_all_day"
                  checked={eventForm.is_all_day}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "is_all_day")}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_datetime" className="text-right">
                Inicio
              </Label>
              <Input
                id="start_datetime"
                name="start_datetime"
                type="datetime-local"
                value={eventForm.start_datetime}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_datetime" className="text-right">
                Fin
              </Label>
              <Input
                id="end_datetime"
                name="end_datetime"
                type="datetime-local"
                value={eventForm.end_datetime}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Ubicación
              </Label>
              <Input
                id="location"
                name="location"
                value={eventForm.location}
                onChange={handleFormChange}
                className="col-span-3"
                placeholder="Ubicación (opcional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={eventForm.description}
                onChange={handleFormChange}
                className="col-span-3"
                placeholder="Descripción del evento (opcional)"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEvent} className="bg-green-600 hover:bg-green-700">
              {editingEvent ? "Actualizar" : "Crear evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarModule;
