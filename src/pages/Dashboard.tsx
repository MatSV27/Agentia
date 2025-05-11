
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Check, DollarSign, Heart, ListCheck, PlusCircle, Settings, TrendingUp } from "lucide-react";
import FinanceModule from "@/components/modules/FinanceModule";
import HabitModule from "@/components/modules/HabitModule";
import WellbeingModule from "@/components/modules/WellbeingModule";
import CalendarModule from "@/components/modules/CalendarModule";

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation header */}
      <header className="py-4 bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-brand-purple text-white flex items-center justify-center font-bold">P</div>
            <span className="text-xl font-bold">PlannerAI</span>
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
          <p className="text-gray-600">Hoy tienes 2 bloques libres para avanzar en tus metas 🎯</p>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-green-600 hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" /> Planear mi día
          </Button>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar hábito
          </Button>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
            <DollarSign className="mr-2 h-4 w-4" /> Registrar gasto
          </Button>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="bg-green-100 text-green-700">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="finance">Finanzas</TabsTrigger>
            <TabsTrigger value="habits">Hábitos</TabsTrigger>
            <TabsTrigger value="wellbeing">Bienestar</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Calendar preview */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Tu día de hoy
                    </CardTitle>
                    <CardDescription>Miércoles, 11 de mayo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded bg-green-50 border border-green-100 flex items-center">
                        <div className="w-1 h-12 bg-green-600 rounded-full mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Reunión de diseño</p>
                          <p className="text-xs text-muted-foreground">10:00 - 11:30 AM</p>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-green-50 border border-green-100 flex items-center">
                        <div className="w-1 h-12 bg-green-400 rounded-full mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Tiempo para leer</p>
                          <p className="text-xs text-muted-foreground">12:30 - 1:00 PM</p>
                        </div>
                        <div>
                          <Button size="sm" variant="ghost" className="h-8 text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-green-50/50 border border-dashed border-green-300 flex items-center">
                        <div className="w-1 h-12 bg-green-300 rounded-full mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">Bloque libre disponible</p>
                          <p className="text-xs text-muted-foreground">3:00 - 4:00 PM</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                          <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right column - Quick widgets */}
              <div className="space-y-6">
                {/* Finance widget */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Resumen Financiero
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Presupuesto mensual</span>
                          <span className="font-medium">75%</span>
                        </div>
                        <Progress value={75} className="h-2 bg-green-100" />
                      </div>
                      <p className="text-sm text-green-600 mt-2">Consejo: Reducir gastos en comida a domicilio ahorraría ~$200</p>
                      <Button size="sm" variant="outline" className="w-full mt-2 text-green-700 border-green-300">
                        Ver finanzas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Habit widget */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ListCheck className="h-5 w-5 text-green-600" />
                      Hábitos de Hoy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm">Leer 15 minutos</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">4/7 días</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm">Meditar 5 minutos</span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">0/7 días</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2 text-green-700 border-green-300">
                        Ver todos los hábitos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Emotional state widget */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5 text-green-600" />
                      ¿Cómo te sientes hoy?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center gap-2 mb-3">
                      {["😊", "😌", "😐", "😓", "😢"].map(emoji => (
                        <Button 
                          key={emoji} 
                          variant={emoji === "😌" ? "default" : "outline"} 
                          className={`text-xl h-10 w-10 p-0 rounded-full ${emoji === "😌" ? "bg-green-600" : "border-green-200"}`}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                    <p className="text-center text-sm italic text-green-700 mt-2">
                      "El éxito no es final, el fracaso no es fatal: es el coraje de continuar lo que cuenta."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Module insights row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <TrendingUp className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Progreso financiero</h3>
                      <p className="text-sm text-green-700">Ahorraste 15% más que el mes pasado.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <ListCheck className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Hábitos efectivos</h3>
                      <p className="text-sm text-green-700">Racha de 7 días en lectura. ¡Sigue así!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <Heart className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Bienestar</h3>
                      <p className="text-sm text-green-700">Recuerda hacer una pausa visual en 10 min.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
                      <Calendar className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">Calendario</h3>
                      <p className="text-sm text-green-700">2 bloques libres hoy para tus metas.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
          
          <TabsContent value="calendar">
            <CalendarModule />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
