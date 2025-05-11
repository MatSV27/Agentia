import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Category {
  id: number;
  name: string;
  color?: string;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: 'ingreso' | 'gasto';
  categories: Category[];
}

export function TransactionForm({ isOpen, onClose, onSubmit, type, categories }: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
  // Mostrar siempre las categorías principales (sin categoría especial de ingreso)
  const mainCategories = ['Comida', 'Transporte', 'Entretenimiento', 'Ahorro'];
  const filteredCategories = categories.filter(cat => 
    mainCategories.includes(cat.name)
  );
  
  // Al abrir el formulario, selecciona una categoría por defecto SOLO si no hay una seleccionada
  useEffect(() => {
    if (isOpen && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id.toString());
    }
  }, [isOpen, filteredCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Asegúrate que siempre haya un category_id
    const data = {
      description,
      amount: parseFloat(amount),
      category_id: parseInt(categoryId),
      type // Asegurar que se envía el tipo correcto (ingreso o gasto)
    };
    
    onSubmit(data);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    // NO reseteo categoryId para mantener la selección previa
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo {type === 'ingreso' ? 'Ingreso' : 'Gasto'}</DialogTitle>
          <DialogDescription>
            Completa los detalles para registrar el {type === 'ingreso' ? 'ingreso' : 'gasto'}.
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
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder={type === 'ingreso' ? "Ej: Sueldo mensual" : "Ej: Supermercado"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <div className="relative">
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 