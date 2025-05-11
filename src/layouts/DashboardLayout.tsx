import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MessageSquare,
  ListCheck, 
  TrendingUp, 
  Heart,
  Settings,
  LogOut,
  User,
  Leaf
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Obtener el nombre del usuario del almacenamiento local
  const userName = localStorage.getItem('userName') || 'Usuario';
  
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
            Bienvenido a tu panel de control
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
          <NavLink 
            to="/dashboard" 
            end
            className={({isActive}) => 
              `py-2 px-4 rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`
            }
          >
            <Calendar className="inline-block mr-2 h-4 w-4" /> 
            Vista General
          </NavLink>
          
          <NavLink 
            to="/dashboard/habits" 
            className={({isActive}) => 
              `py-2 px-4 rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`
            }
          >
            <ListCheck className="inline-block mr-2 h-4 w-4" /> 
            Hábitos
          </NavLink>
          
          <NavLink 
            to="/dashboard/finance" 
            className={({isActive}) => 
              `py-2 px-4 rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`
            }
          >
            <TrendingUp className="inline-block mr-2 h-4 w-4" /> 
            Finanzas
          </NavLink>
          
          <NavLink 
            to="/dashboard/wellbeing" 
            className={({isActive}) => 
              `py-2 px-4 rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`
            }
          >
            <Heart className="inline-block mr-2 h-4 w-4" /> 
            Bienestar
          </NavLink>
          
          <NavLink 
            to="/dashboard/bot" 
            className={({isActive}) => 
              `py-2 px-4 rounded-md transition-colors ${
                isActive ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`
            }
          >
            <MessageSquare className="inline-block mr-2 h-4 w-4" /> 
            Chat IA
          </NavLink>
        </div>
        
        {/* Content area - will be filled by the child routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 