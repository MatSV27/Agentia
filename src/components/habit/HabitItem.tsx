import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, MoreVertical, Pencil, Trash2, ArchiveIcon } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface HabitItemProps {
  habit: {
    id: number;
    name: string;
    category: {
      name: string;
      color: string;
    };
    frequency: string;
    days_of_week?: string[];
    days_of_month?: number[];
    current_streak: number;
    completed_today: boolean;
    scheduled_today?: boolean;
    start_time?: string;
    end_time?: string;
  };
  onComplete: (habitId: number) => void;
  onUncomplete: (habitId: number) => void;
  onEdit: (habit: any) => void;
  onArchive: (habitId: number) => void;
  onDelete: (habitId: number) => void;
}

export function HabitItem({ habit, onComplete, onUncomplete, onEdit, onArchive, onDelete }: HabitItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  
  // Formatear la frecuencia para mostrar
  const getScheduleText = () => {
    let scheduleText = '';
    
    // Frecuencia
    if (habit.frequency === 'daily') scheduleText = 'Diario';
    else if (habit.frequency === 'weekly' && habit.days_of_week) {
      // Convertir abreviaturas en inglés a español
      const dayMap: Record<string, string> = {
        'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 
        'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb', 'Sun': 'Dom'
      };
      scheduleText = habit.days_of_week.map(day => dayMap[day] || day).join('-');
    }
    else if (habit.frequency === 'monthly' && habit.days_of_month) {
      scheduleText = `${habit.days_of_month.length} días al mes`;
    }
    else {
      scheduleText = habit.frequency;
    }
    
    // Añadir horario si está definido
    if (habit.start_time && habit.end_time && 
        !(habit.start_time === '00:00' && habit.end_time === '23:59')) {
      scheduleText += ` · ${habit.start_time} - ${habit.end_time}`;
    }
    
    return scheduleText;
  };
  
  // Manejar la acción de completar/descompletar
  const handleToggleComplete = async () => {
    setIsCompleting(true);
    try {
      if (habit.completed_today) {
        await onUncomplete(habit.id);
        toast({
          title: "Hábito desmarcado",
          description: `Has desmarcado "${habit.name}" como completado.`,
        });
      } else {
        await onComplete(habit.id);
        toast({
          title: "¡Bien hecho!",
          description: `Has completado "${habit.name}" por ${habit.current_streak + 1} día(s) consecutivo(s).`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del hábito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  return (
    <div 
      className={`p-3 rounded flex items-center justify-between ${
        habit.completed_today ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            habit.completed_today ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Check className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{habit.name}</p>
          <div className="flex items-center gap-2">
            <span 
              className={`inline-block w-2 h-2 rounded-full bg-${habit.category.color || 'green'}-500`}
            />
            <p className="text-xs text-muted-foreground">
              {habit.category.name} • {getScheduleText()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-center mr-2">
          <div className="text-sm font-medium">{habit.current_streak}</div>
          <div className="text-xs text-muted-foreground">Racha</div>
        </div>
        
        <div className="flex gap-2">
          {!habit.completed_today ? (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleToggleComplete}
              disabled={isCompleting}
            >
              Completar
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="border-green-200 text-green-700"
              onClick={handleToggleComplete}
              disabled={isCompleting}
            >
              Desmarcar
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            className="border-blue-200 text-blue-700 px-2"
            onClick={() => onEdit(habit)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-amber-200 text-amber-700 px-2"
            onClick={() => onArchive(habit.id)}
          >
            <ArchiveIcon className="h-3.5 w-3.5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                Editar hábito
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(habit.id)}>
                Archivar hábito
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(habit.id)}
                className="text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" /> 
                Eliminar hábito
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 