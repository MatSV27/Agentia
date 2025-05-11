import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SavingsGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: {
    id?: number;
    name?: string;
    target_amount?: number;
    current_amount?: number;
    target_date?: string;
  };
  mode: 'create' | 'add';
}

export function SavingsGoalForm({ isOpen, onClose, onSubmit, initialData, mode }: SavingsGoalFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [targetAmount, setTargetAmount] = useState(initialData?.target_amount?.toString() || "");
  const [currentAmount, setCurrentAmount] = useState(initialData?.current_amount?.toString() || "");
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [targetDate, setTargetDate] = useState(initialData?.target_date || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const data = {
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || "0"),
        target_date: targetDate || null
      };
      onSubmit(data);
    } else if (mode === 'add' && initialData?.id) {
      const data = {
        current_amount: (initialData.current_amount || 0) + parseFloat(additionalAmount)
      };
      onSubmit(data);
    }
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    if (mode === 'create') {
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
    } else {
      setAdditionalAmount("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva Meta de Ahorro' : 'Añadir Fondos a Meta'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Define una nueva meta para tu ahorro.' 
              : 'Añade fondos a tu meta de ahorro.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la meta</Label>
                <Input
                  id="name"
                  placeholder="Ej: Viaje a Japón"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Cantidad objetivo</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Cantidad inicial (opcional)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDate">Fecha objetivo (opcional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="additionalAmount">Cantidad a añadir</Label>
              <Input
                id="additionalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={additionalAmount}
                onChange={(e) => setAdditionalAmount(e.target.value)}
                required
              />
              
              {initialData && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span>Cantidad actual:</span>
                    <span className="font-medium">${initialData.current_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Objetivo:</span>
                    <span className="font-medium">${initialData.target_amount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {mode === 'create' ? 'Crear Meta' : 'Añadir Fondos'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 