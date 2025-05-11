
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListCheck, Heart, DollarSign, Settings, MessageSquare, Check, Leaf } from "lucide-react";
import ChatModule from "@/components/modules/ChatModule";
import FinanceModule from "@/components/modules/FinanceModule";
import HabitModule from "@/components/modules/HabitModule";
import WellbeingModule from "@/components/modules/WellbeingModule";
import CalendarModule from "@/components/modules/CalendarModule";

const ChatPage = () => {
  const [selectedTab, setSelectedTab] = useState("chat");

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
              Alexandra
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Greeting section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Hola, Alexandra! 👋</h1>
          <p className="text-gray-600">¿En qué puedo ayudarte hoy?</p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-green-600 hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" /> Planear mi día
          </Button>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <ListCheck className="mr-2 h-4 w-4" /> Mis hábitos
          </Button>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <DollarSign className="mr-2 h-4 w-4" /> Finanzas
          </Button>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="chat" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="bg-green-100 text-green-700">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> Chat IA
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-1" /> Calendario
            </TabsTrigger>
            <TabsTrigger value="finance">
              <DollarSign className="h-4 w-4 mr-1" /> Finanzas
            </TabsTrigger>
            <TabsTrigger value="habits">
              <ListCheck className="h-4 w-4 mr-1" /> Hábitos
            </TabsTrigger>
            <TabsTrigger value="wellbeing">
              <Heart className="h-4 w-4 mr-1" /> Bienestar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <ChatModule />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <CalendarModule />
          </TabsContent>
          
          <TabsContent value="finance">
            <FinanceModule />
          </TabsContent>
          
          <TabsContent value="habits">
            <HabitModule />
          </TabsContent>
          
          <TabsContent value="wellbeing">
            <WellbeingModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ChatPage;
