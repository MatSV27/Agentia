
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PlusCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const FinanceModule = () => {
  const [activeView, setActiveView] = useState("overview");
  
  // Example data for financial module
  const categories = [
    { name: "Comida", spent: 450, budget: 500, percentage: 90 },
    { name: "Transporte", spent: 180, budget: 300, percentage: 60 },
    { name: "Entretenimiento", spent: 220, budget: 200, percentage: 110 },
    { name: "Ahorro", spent: 300, budget: 300, percentage: 100 },
  ];
  
  const transactions = [
    { id: 1, description: "Supermercado", amount: -85.50, category: "Comida", date: "10 Mayo" },
    { id: 2, description: "Sueldo mensual", amount: 1200.00, category: "Ingreso", date: "5 Mayo" },
    { id: 3, description: "Restaurante", amount: -32.40, category: "Comida", date: "8 Mayo" },
    { id: 4, description: "Uber", amount: -12.80, category: "Transporte", date: "9 Mayo" },
  ];
  
  const insights = [
    "Gastas un 25% más en comida a domicilio que el mes pasado.",
    "Tu categoría de ahorro ha alcanzado su meta por 3 meses consecutivos. ¡Felicidades!",
    "Considera reducir gastos en entretenimiento para mantener tu presupuesto.",
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Finanzas Personales</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-200 text-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo ingreso
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Balance total</span>
              <span className="text-2xl font-bold">$2,540.65</span>
              <span className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> +5% desde el mes pasado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Gastos del mes</span>
              <span className="text-2xl font-bold">$1,250.30</span>
              <span className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" /> -3% desde el mes pasado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Ingresos del mes</span>
              <span className="text-2xl font-bold">$3,200.00</span>
              <span className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> Igual al mes pasado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Meta de ahorro</span>
              <span className="text-2xl font-bold">$1,500 / $5,000</span>
              <div className="w-full mt-2">
                <Progress value={30} className="h-2 bg-green-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget categories and transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Categorías de presupuesto</CardTitle>
              <CardDescription>Progreso por categoría en el mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-medium">${category.spent} / ${category.budget}</span>
                    </div>
                    <Progress 
                      value={category.percentage} 
                      className={`h-2 ${
                        category.percentage > 100 
                          ? "bg-red-100" 
                          : category.percentage > 80 
                            ? "bg-yellow-100" 
                            : "bg-green-100"
                      }`} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Últimas transacciones</CardTitle>
              <CardDescription>Movimientos recientes en tus cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded border border-green-100 bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.amount > 0 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <span 
                      className={`font-medium ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-green-200 text-green-700">
                Ver todas las transacciones
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Consejos financieros
              </CardTitle>
              <CardDescription>Recomendaciones basadas en tu actividad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm text-green-800">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Meta de ahorro</CardTitle>
              <CardDescription>Viaje a Japón</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-3 bg-green-100" />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ahorrado</span>
                  <span className="font-medium">$1,500</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Objetivo</span>
                  <span className="font-medium">$5,000</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Fecha objetivo</span>
                  <span className="font-medium">Diciembre 2025</span>
                </div>
                
                <Button className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  Añadir fondos a meta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
