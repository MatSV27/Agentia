import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Clock } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Tipo para categorías de hábitos
interface HabitCategory {
  id: number;
  name: string;
  color: string;
}

// Props para el componente
interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // Para editar un hábito existente
}

// Componente de formulario de hábito
export function HabitForm({ isOpen, onClose, onSubmit, initialData }: HabitFormProps) {
  // Estados para los datos del formulario
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startTime, setStartTime] = useState<string>("00:00");
  const [endTime, setEndTime] = useState<string>("23:59");
  
  // Estado para categorías disponibles
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Días de la semana
  const weekdays = [
    { id: "Mon", label: "Lunes" },
    { id: "Tue", label: "Martes" },
    { id: "Wed", label: "Miércoles" },
    { id: "Thu", label: "Jueves" },
    { id: "Fri", label: "Viernes" },
    { id: "Sat", label: "Sábado" },
    { id: "Sun", label: "Domingo" },
  ];
  
  // Días del mes
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Cargar categorías de hábitos al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        
        const response = await fetch('https://agentia-flask-api-986748001268.us-central1.run.app/api/habits/categories', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Si hay datos iniciales (edición), configurarlos
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategoryId(initialData.category?.id.toString() || "");
      setFrequency(initialData.frequency || "daily");
      setDaysOfWeek(initialData.days_of_week || []);
      setDaysOfMonth(initialData.days_of_month || []);
      
      if (initialData.start_date) {
        setStartDate(new Date(initialData.start_date));
      }
      
      if (initialData.end_date) {
        setEndDate(new Date(initialData.end_date));
        setShowEndDate(true);
      }
      
      if (initialData.start_time) {
        setStartTime(initialData.start_time);
      }
      
      if (initialData.end_time) {
        setEndTime(initialData.end_time);
      }
    }
  }, [initialData, isOpen]);
  
  // Resetear el formulario al cerrar
  const resetForm = () => {
    setName("");
    setCategoryId("");
    setFrequency("daily");
    setDaysOfWeek([]);
    setDaysOfMonth([]);
    setStartDate(new Date());
    setEndDate(undefined);
    setShowEndDate(false);
    setStartTime("00:00");
    setEndTime("23:59");
  };
  
  // Manejar cambios en los días de la semana
  const handleWeekdayChange = (day: string) => {
    setDaysOfWeek(prevDays => 
      prevDays.includes(day) 
        ? prevDays.filter(d => d !== day) 
        : [...prevDays, day]
    );
  };
  
  // Manejar cambios en los días del mes
  const handleMonthDayChange = (day: number) => {
    setDaysOfMonth(prevDays => 
      prevDays.includes(day) 
        ? prevDays.filter(d => d !== day) 
        : [...prevDays, day]
    );
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitData = {
      name,
      category_id: parseInt(categoryId),
      frequency,
      days_of_week: frequency === 'weekly' ? daysOfWeek : [],
      days_of_month: frequency === 'monthly' ? daysOfMonth : [],
      start_date: startDate.toISOString().split('T')[0],
      end_date: showEndDate && endDate ? endDate.toISOString().split('T')[0] : undefined,
      start_time: startTime,
      end_time: endTime
    };
    
    onSubmit(habitData);
    resetForm();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar hábito" : "Nuevo hábito"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Actualiza los detalles de tu hábito."
              : "Crea un nuevo hábito para tu seguimiento diario."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del hábito */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del hábito</Label>
            <Input
              id="name"
              placeholder="Ej: Leer 15 minutos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id.toString()}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                    <span>{category.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Frecuencia */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <Select 
              value={frequency} 
              onValueChange={setFrequency}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Días de la semana (solo si es semanal) */}
          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Días de la semana</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {weekdays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day.id}`}
                      checked={daysOfWeek.includes(day.id)}
                      onCheckedChange={() => handleWeekdayChange(day.id)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Días del mes (solo si es mensual) */}
          {frequency === "monthly" && (
            <div className="space-y-2">
              <Label>Días del mes</Label>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
                {monthDays.map((day) => (
                  <div key={day} className="flex items-center space-x-1">
                    <Checkbox 
                      id={`month-day-${day}`}
                      checked={daysOfMonth.includes(day)}
                      onCheckedChange={() => handleMonthDayChange(day)}
                      className="scale-75"
                    />
                    <Label htmlFor={`month-day-${day}`} className="text-xs">{day}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fecha de inicio */}
          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Opción para fecha de fin */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-end-date"
              checked={showEndDate}
              onCheckedChange={(checked) => setShowEndDate(checked as boolean)}
            />
            <Label htmlFor="show-end-date">Establecer fecha de fin (opcional)</Label>
          </div>
          
          {/* Fecha de fin (condicional) */}
          {showEndDate && (
            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PP") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => setEndDate(date)}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          {/* Hora de inicio */}
          <div className="space-y-2">
            <Label>Hora de inicio</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          
          {/* Hora de fin */}
          <div className="space-y-2">
            <Label>Hora de fin</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {initialData ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 