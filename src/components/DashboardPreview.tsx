import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Check, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";

const DashboardPreview = () => {
  const [userName, setUserName] = useState("Usuario");
  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Dashboard Inteligente</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visualiza tu progreso, planifica tu día y recibe recomendaciones personalizadas
              basadas en tus hábitos y metas.
            </p>
          </div>
          
          {/* Dashboard Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border shadow-lg p-6 overflow-hidden">
            {/* User greeting and stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">¡Hola, {userName}! 👋</h3>
                <p className="text-muted-foreground">Hoy tienes 2 bloques libres para avanzar en tus metas 🎯</p>
              </div>
              
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Calendar className="mr-2 h-4 w-4" /> Planear mi día
              </Button>
            </div>
            
            {/* Dashboard grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today's calendar */}
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Tu día de hoy</CardTitle>
                  <CardDescription>Miércoles, 11 de mayo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Calendar events */}
                    <div className="p-3 rounded bg-slate-100 border border-slate-200 flex items-center">
                      <div className="w-1 h-12 bg-brand-purple rounded-full mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reunión de diseño</p>
                        <p className="text-xs text-muted-foreground">10:00 - 11:30 AM</p>
                      </div>
                    </div>
                    <div className="p-3 rounded bg-slate-100 border border-slate-200 flex items-center">
                      <div className="w-1 h-12 bg-brand-teal rounded-full mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tiempo para leer</p>
                        <p className="text-xs text-muted-foreground">12:30 - 1:00 PM</p>
                      </div>
                    </div>
                    <div className="p-3 rounded bg-brand-purple/5 border border-dashed border-brand-purple/30 flex items-center">
                      <div className="w-1 h-12 bg-brand-purple/30 rounded-full mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-purple">Bloque libre disponible</p>
                        <p className="text-xs text-muted-foreground">3:00 - 4:00 PM</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-brand-purple">
                        <PlusCircle className="h-4 w-4 mr-1" /> Agregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Habit recommendation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Recomendación de hoy</CardTitle>
                  <CardDescription>Basado en tus metas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <Check className="text-brand-blue h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Leer 15 minutos</p>
                        <p className="text-sm text-muted-foreground">Para tu meta de aprendizaje</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso semanal</span>
                        <span className="font-medium">3/5 días</span>
                      </div>
                      <Progress value={60} className="h-2 bg-slate-100" />
                    </div>
                    
                    <div className="pt-2">
                      <Button size="sm" className="w-full bg-brand-blue hover:bg-brand-blue/90">
                        Aceptar sugerencia
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Emotional state */}
              <Card className="col-span-full">
                <CardHeader className="pb-2">
                  <CardTitle>Estado emocional</CardTitle>
                  <CardDescription>¿Cómo te sientes hoy?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {["😊", "😌", "😐", "😓", "😢"].map(emoji => (
                      <Button 
                        key={emoji} 
                        variant="outline" 
                        className="text-2xl h-14 w-14 rounded-full"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center mt-4 italic text-muted-foreground">
                    "El éxito no es final, el fracaso no es fatal: es el coraje de continuar lo que cuenta."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
