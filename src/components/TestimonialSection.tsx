
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatarSrc?: string;
}

const Testimonial = ({ quote, author, role, avatarSrc }: TestimonialProps) => {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <blockquote className="text-lg mb-6 flex-grow">"{quote}"</blockquote>
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={author} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{author}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TestimonialSection = () => {
  const testimonials = [
    {
      quote:
        "Esta app ha transformado mi manera de organizar mi día. El coach IA me ayuda a mantenerme motivado y enfocado en mis metas.",
      author: "Carlos Méndez",
      role: "Diseñador UX",
    },
    {
      quote:
        "El seguimiento de hábitos y la analítica personal me han permitido identificar patrones y optimizar mi rutina diaria.",
      author: "María Fernández",
      role: "Emprendedora",
    },
    {
      quote:
        "La integración del calendario con las metas es perfecta. Ahora puedo ver claramente cómo cada bloque de tiempo me acerca a mis objetivos.",
      author: "David Rodríguez",
      role: "Desarrollador Web",
    },
  ];

  return (
    <section className="py-20 bg-brand-light">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo que dicen nuestros usuarios</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre cómo nuestra plataforma está transformando la productividad y el bienestar
            de miles de personas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
