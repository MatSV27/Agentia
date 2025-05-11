import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MessageSquare, Settings, Leaf, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatModule from "@/components/modules/ChatModule";

const ChatPage = () => {
  const [userName, setUserName] = useState("Usuario");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

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
            <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
              {userName}
            </Button>
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
        
        {/* Chat module only */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-4">
            <MessageSquare className="h-5 w-5 text-green-700" /> 
            <h2 className="text-xl font-semibold text-green-700">Chat IA</h2>
          </div>
          <ChatModule />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
