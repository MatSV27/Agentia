import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Leaf, Calendar, DollarSign, ListCheck, Heart } from "lucide-react";
import { useState } from "react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <header className="py-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold seed-icon">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AgentIA</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-green-700 hover:text-green-800 hover:bg-green-50">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-green-600 hover:bg-green-700">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-green-50 to-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="text-gradient-green block">Tu asistente personal</span> 
                  para una vida más organizada
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  AgentIA conecta tu bienestar, finanzas, hábitos y tiempo en un solo lugar, 
                  con un asistente inteligente que te ayuda a conseguir tus metas de forma simple.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                      Comienza ahora
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    <span className="font-semibold">+1,000</span> usuarios organizando su vida
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-white p-4 shadow-lg border border-green-100 hover-scale-subtle">
                  <div className="flex items-center gap-3 mb-4 p-2 rounded-full bg-green-50 border border-green-100 w-max">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <span className="pr-3 font-medium text-green-800">AgentIA</span>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg mb-3 max-w-[85%] text-sm">
                    ¡Hola! Soy tu asistente personal. ¿Cómo puedo ayudarte hoy?
                  </div>
                  
                  <div className="p-3 bg-white border border-green-100 rounded-lg mb-3 max-w-[85%] ml-auto text-sm">
                    Necesito ayuda para organizar mi día
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg mb-3 max-w-[85%] text-sm">
                    Claro, veo que tienes dos bloques libres hoy: 11:30 AM y 3:15 PM. ¿Te gustaría programar alguna actividad?
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 bg-white text-green-700 border-green-200">
                      <Calendar className="h-3 w-3" /> Usar bloque de 11:30 AM
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs flex items-center gap-1 bg-white text-green-700 border-green-200">
                      <Calendar className="h-3 w-3" /> Usar bloque de 3:15 PM
                    </Button>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-green-100 rounded-full z-[-1]"></div>
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-green-200/50 rounded-full z-[-1]"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Todo conectado en un solo lugar</h2>
              <p className="text-gray-600">
                Organiza cada aspecto importante de tu vida con nuestros cuatro módulos principales,
                todos integrados con inteligencia artificial para una experiencia personalizada.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-xl border border-green-100 bg-white shadow-sm hover-scale-subtle">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Finanzas Personales</h3>
                <p className="text-gray-600">
                  Registra gastos e ingresos, visualiza patrones y recibe consejos personalizados 
                  para mejorar tu salud financiera.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border border-green-100 bg-white shadow-sm hover-scale-subtle">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <ListCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Registro de Hábitos</h3>
                <p className="text-gray-600">
                  Crea y mantén hábitos positivos con seguimiento diario, estadísticas 
                  de cumplimiento y recordatorios adaptables.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border border-green-100 bg-white shadow-sm hover-scale-subtle">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bienestar Personal</h3>
                <p className="text-gray-600">
                  Cuida tu salud física y mental con recordatorios de descanso, 
                  pausas activas y técnicas de respiración.
                </p>
              </div>
              
              <div className="p-6 rounded-xl border border-green-100 bg-white shadow-sm hover-scale-subtle">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Calendario Inteligente</h3>
                <p className="text-gray-600">
                  Sincroniza tu calendario, detecta espacios libres y recibe sugerencias 
                  inteligentes para optimizar tu tiempo.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Comienza a cultivar mejores hábitos hoy
              </h2>
              <p className="text-lg mb-8 text-white/90">
                Únete a miles de personas que están transformando sus hábitos 
                y alcanzando sus metas con nuestra plataforma inteligente.
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-white text-green-700 hover:bg-white/90">
                  Comenzar Gratis - 14 Días de Prueba
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">AgentIA</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-green-600">Sobre nosotros</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-green-600">Funcionalidades</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Precios</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Integraciones</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-green-600">Guías</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Documentación</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Webinars</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-500 hover:text-green-600">Privacidad</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Términos</a></li>
                <li><a href="#" className="text-gray-500 hover:text-green-600">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} AgentIA. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.504.344-1.857.182-.467.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
