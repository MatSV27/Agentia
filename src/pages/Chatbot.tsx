import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, User, Settings, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatModule from "@/components/modules/ChatModule";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const Chatbot = () => {
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
          <p className="text-gray-600">¿En qué puedo ayudarte hoy?</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate("/dashboard")}>
            <Calendar className="mr-2 h-4 w-4" /> Planear mi día
          </Button>
        </div>

        {/* Chat section - full screen dedicated to chat */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex items-center gap-2 text-xl text-green-800">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <Leaf className="h-5 w-5" />
                </div>
                Coach Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ChatModule />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chatbot; 