
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, PlusCircle, ListCheck, Heart, DollarSign } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const CalendarModule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Example data for calendar events
  const events = [
    { 
      id: 1, 
      title: "Reunión de diseño", 
      time: "10:00 - 11:30 AM", 
      type: "work",
      color: "bg-blue-600"
    },
    { 
      id: 2, 
      title: "Tiempo para leer", 
      time: "12:30 - 1:00 PM", 
      type: "habit",
      color: "bg-green-600"
    },
    { 
      id: 3, 
      title: "Llamada con cliente", 
      time: "2:00 - 2:30 PM", 
      type: "work",
      color: "bg-blue-600"
    },
    { 
      id: 4, 
      title: "Descanso activo", 
      time: "3:00 - 3:15 PM", 
      type: "wellbeing",
      color: "bg-purple-600"
    },
    { 
      id: 5, 
      title: "Revisar finanzas", 
      time: "5:00 - 5:30 PM", 
      type: "finance",
      color: "bg-yellow-600"
    },
  ];
  
  const freeBlocks = [
    { id: 1, time: "11:30 AM - 12:30 PM" },
    { id: 2, time: "3:15 - 4:00 PM" },
  ];
  
  const recommendations = [
    { id: 1, title: "Práctica de guitarra", time: "11:30 AM - 12:00 PM", type: "habit" },
    { id: 2, title: "Revisar metas semanales", time: "3:15 - 3:45 PM", type: "planning" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Calendario Inteligente</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-200 text-green-700">
            <CalendarIcon className="mr-2 h-4 w-4" /> Sincronizar Google Calendar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-sm">Trabajo / Reuniones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  <span className="text-sm">Hábitos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm">Bienestar</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                  <span className="text-sm">Finanzas</span>
                </div>
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
                <CardDescription>Miércoles, 11 de mayo</CardDescription>
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
                  {events.map((event, idx) => (
                    <div key={event.id} className="mb-6 relative">
                      <div className="absolute -left-10 mt-1.5">
                        <div className={`w-5 h-5 rounded-full ${event.color}`}></div>
                      </div>
                      <div className="p-4 rounded border border-green-100 bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.time}</p>
                          </div>
                          <div className="flex gap-1">
                            {event.type === "habit" && <ListCheck className="h-4 w-4 text-green-600" />}
                            {event.type === "wellbeing" && <Heart className="h-4 w-4 text-purple-600" />}
                            {event.type === "finance" && <DollarSign className="h-4 w-4 text-yellow-600" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Free blocks */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Bloques libres disponibles</CardTitle>
                    <CardDescription>Tiempo para avanzar en tus metas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {freeBlocks.map((block) => (
                        <div key={block.id} className="flex justify-between items-center p-3 border border-dashed border-green-300 rounded bg-green-50/50">
                          <span className="font-medium text-green-800">{block.time}</span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <PlusCircle className="h-4 w-4 mr-1" /> Planificar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
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
    </div>
  );
};

export default CalendarModule;
