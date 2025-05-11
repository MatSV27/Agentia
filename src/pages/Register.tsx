import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import config from "@/lib/config";
import API_CONFIG from "@/config/api";

// Interfaz para el manejo de errores
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!name) newErrors.name = "El nombre es requerido";
    if (!email) newErrors.email = "El correo electrónico es requerido";
    if (!password) newErrors.password = "La contraseña es requerida";
    if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const data = await API_CONFIG.fetchApi('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      
      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error al crear tu cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold seed-icon">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">AgentIA</span>
          </Link>
        </div>

        <Card className="border-green-100 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus datos para registrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-green-600 hover:text-green-800 font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
