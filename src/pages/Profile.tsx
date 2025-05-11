import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const [name, setName] = useState("Usuario");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Me encanta organizar mi vida y desarrollar buenos hábitos.");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setName(storedName);
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API update
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "¡Perfil actualizado!",
        description: "Tus cambios han sido guardados correctamente.",
      });
    }, 1000);
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
          
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> 
            Volver
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Mi Perfil</h1>
          
          <Card className="border-green-100 shadow-sm">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tus datos personales y preferencias</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="minimalist-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="minimalist-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Biografía
                  </label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="minimalist-input h-24"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <div className="text-sm text-muted-foreground mt-4">
                Para cambiar tu contraseña, <Link to="/change-password" className="text-green-600 hover:underline">haz clic aquí</Link>.
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <Card className="border-green-100 border-dashed bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-red-600">Zona de peligro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Si deseas eliminar tu cuenta permanentemente, puedes hacerlo desde aquí. Esta acción no se puede deshacer.
                </p>
                <Button variant="destructive">Eliminar mi cuenta</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
