
import { Calendar, MessageCircle, Check, Target, BarChart, Clock } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeatureSection = () => {
  const features = [
    {
      title: "Planificador Inteligente",
      description: "Calendario sincronizado con sugerencias automáticas de hábitos y metas según tus bloques libres.",
      icon: Calendar,
      iconBgColor: "bg-brand-blue/10",
      iconColor: "text-brand-blue"
    },
    {
      title: "Coach Diario (IA)",
      description: "Chat conversacional que te motiva, recuerda tus compromisos y te ayuda a reflexionar sobre tu progreso.",
      icon: MessageCircle,
      iconBgColor: "bg-brand-purple/10",
      iconColor: "text-brand-purple"
    },
    {
      title: "Seguimiento de Hábitos",
      description: "Visualiza y registra tus hábitos diarios con vistas semanales y mensuales para ver tus rachas de éxito.",
      icon: Check,
      iconBgColor: "bg-brand-teal/10",
      iconColor: "text-brand-teal"
    },
    {
      title: "Gestión de Metas",
      description: "Divide tus metas en micro-acciones, visualiza tu progreso y programa automáticamente en tu calendario.",
      icon: Target,
      iconBgColor: "bg-amber-500/10",
      iconColor: "text-amber-500"
    },
    {
      title: "Analítica Personal",
      description: "Gráficos detallados de tu progreso, tiempos invertidos e insights automáticos sobre tus patrones.",
      icon: BarChart,
      iconBgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500"
    },
    {
      title: "Optimización del Tiempo",
      description: "Descubre tus momentos más productivos y recibe sugerencias para optimizar tu agenda diaria.",
      icon: Clock,
      iconBgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500"
    }
  ];

  return (
    <section className="py-20 feature-gradient">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todas las herramientas que necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nuestra plataforma integra planificación, seguimiento y análisis para 
            potenciar tu productividad y bienestar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconBgColor={feature.iconBgColor}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
