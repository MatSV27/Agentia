import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
  budget: number;
  color?: string;
}

interface CategoryBudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryId: number, budget: number) => void;
  category: Category | null;
}

export function CategoryBudgetForm({ isOpen, onClose, onSubmit, category }: CategoryBudgetFormProps) {
  const [budget, setBudget] = useState(category?.budget.toString() || "0");

  // Actualizar el presupuesto cuando cambia la categoría
  useEffect(() => {
    if (category) {
      setBudget(category.budget.toString());
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category) {
      onSubmit(category.id, parseFloat(budget));
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Establecer meta de presupuesto</DialogTitle>
          <DialogDescription>
            Actualiza el presupuesto mensual para: {category?.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 