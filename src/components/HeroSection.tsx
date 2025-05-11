
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, Check } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-teal/10 animate-gradient-flow" />
      
      {/* Content */}
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Organiza tu vida con
            <span className="gradient-text block"> Inteligencia Artificial</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
            Una plataforma que combina planificación inteligente, seguimiento de hábitos y coaching 
            personalizado para ayudarte a alcanzar tus metas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="bg-brand-purple hover:bg-brand-purple/90" asChild>
              <Link to="/dashboard">Comenzar Gratis</Link>
            </Button>
            <Button size="lg" variant="outline">
              Ver Demo
            </Button>
          </div>
          
          {/* Feature highlight icons */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-purple/20 flex items-center justify-center mb-2">
                <Calendar className="text-brand-purple h-6 w-6" />
              </div>
              <span className="text-sm">Planificador</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center mb-2">
                <MessageCircle className="text-brand-blue h-6 w-6" />
              </div>
              <span className="text-sm">Coach IA</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-brand-teal/20 flex items-center justify-center mb-2">
                <Check className="text-brand-teal h-6 w-6" />
              </div>
              <span className="text-sm">Hábitos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
