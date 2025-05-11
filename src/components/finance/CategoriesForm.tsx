import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: number;
  name: string;
  budget: number;
  color?: string;
}

interface CategoriesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (categoryId: number, name: string, budget: number) => void;
  categories: Category[];
}

export function CategoriesForm({ isOpen, onClose, onUpdate, categories }: CategoriesFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  
  // Lista de categorías filtradas (sin ingresos)
  const filteredCategories = categories.filter(cat => !cat.name.toLowerCase().includes('ingreso'));

  // Al abrir, si hay categorías, seleccionar la primera por defecto
  useEffect(() => {
    if (isOpen && filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0]);
      setName(filteredCategories[0].name);
      setBudget(filteredCategories[0].budget.toString());
    }
  }, [isOpen, filteredCategories, selectedCategory]);

  // Actualizar campos cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name);
      setBudget(selectedCategory.budget.toString());
    }
  }, [selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategory) {
      onUpdate(
        selectedCategory.id,
        name,
        parseFloat(budget)
      );
    }
    
    // No cerrar el diálogo para permitir editar otras categorías
  };

  // Función para cambiar la categoría seleccionada
  const handleCategoryChange = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategory(category);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar categorías</DialogTitle>
          <DialogDescription>
            Actualiza el nombre y presupuesto de las categorías
          </DialogDescription>
        </DialogHeader>
        
        {filteredCategories.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm">
              No hay categorías disponibles. Por favor, recarga la página para ver las categorías.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Selecciona una categoría</Label>
              <div className="relative">
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedCategory?.id || ""}
                  onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
                >
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center mr-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la categoría</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Comida"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto mensual</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cerrar
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 