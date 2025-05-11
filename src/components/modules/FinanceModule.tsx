import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PlusCircle, TrendingUp, TrendingDown, Edit2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { SavingsGoalForm } from "@/components/finance/SavingsGoalForm";
import { CategoryBudgetForm } from "@/components/finance/CategoryBudgetForm";
import { CategoriesForm } from "@/components/finance/CategoriesForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API_CONFIG from "@/config/api";

// Tipos de datos
interface Category {
  id: number;
  name: string;
  budget: number;
  spent: number;
  percentage: number;
  color?: string;
  income?: number;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category_name: string;
  date: string;
  type: string;
  formatted_date?: string;
}

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
}

interface FinanceSummary {
  balance_total: number;
  gastos_mes: number;
  ingresos_mes: number;
  variacion_gastos: number;
  variacion_ingresos: number;
  categorias: {
    id: number;
    name: string;
    budget: number;
    spent: number;
    color?: string;
    income?: number;
  }[];
  metas_ahorro: SavingsGoal[];
}

// Función para agrupar categorías por tipo
const getCategoryGroups = (categories: Category[]) => {
  const groups = {
    "Gastos": ["Comida", "Transporte", "Entretenimiento"],
    "Ahorros": ["Ahorro"],
  };
  
  // Clasificar cada categoría en un grupo
  const categoriesByGroup: {[key: string]: Category[]} = {};
  
  // Inicializar grupos
  Object.keys(groups).forEach(group => {
    categoriesByGroup[group] = [];
  });
  
  // Distribuir categorías en grupos
  categories.forEach(category => {
    if (category.name.toLowerCase().includes('ingreso')) {
      return; // Ignorar categorías de ingreso aquí
    }
    
    if (category.name === 'Ahorro') {
      categoriesByGroup["Ahorros"].push(category);
    } else if (!category.name.toLowerCase().includes('ingreso')) {
      categoriesByGroup["Gastos"].push(category);
    }
  });
  
  return categoriesByGroup;
};

const FinanceModule = () => {
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los datos financieros
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  
  // Estados para modales/diálogos
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isSavingsGoalFormOpen, setIsSavingsGoalFormOpen] = useState(false);
  const [isAddToGoalFormOpen, setIsAddToGoalFormOpen] = useState(false);
  
  // Pestaña activa de categorías
  const [activeTab, setActiveTab] = useState("todas");
  
  // Estado para el formulario de edición de presupuesto
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estado para el formulario de edición de categorías
  const [isCategoriesFormOpen, setIsCategoriesFormOpen] = useState(false);
  
  const { toast } = useToast();

  // Función para asegurar que existe una categoría de ingreso
  const ensureIncomeCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Usar la nueva función fetchApi
      await API_CONFIG.fetchApi('/api/categories/ensure-income', {
        method: 'POST'
      });
      
      // Recargar categorías después de asegurar la categoría de ingreso
      await loadFinanceSummary();
      
    } catch (err) {
      console.error("Error al asegurar categoría de ingreso:", err);
    }
  };

  // Función para abrir el formulario de ingreso
  const openIncomeForm = async () => {
    // Esperar un momento para asegurarse de que las categorías se actualicen
    if (categories.length === 0) {
      await loadFinanceSummary();
    }
    
    // Ahora abrir el formulario
    setIsIncomeFormOpen(true);
  };

  // Función para abrir el formulario de gasto
  const openExpenseForm = async () => {
    // Esperar un momento para asegurarse de que las categorías se actualicen
    if (categories.length === 0) {
      await loadFinanceSummary();
    }
    
    // Ahora abrir el formulario
    setIsExpenseFormOpen(true);
  };

  // Función para abrir el formulario de categorías
  const openCategoriesForm = async () => {
    // Esperar un momento para asegurarse de que las categorías se actualicen
    if (categories.length === 0) {
      await loadFinanceSummary();
    }
    
    // Ahora abrir el formulario
    setIsCategoriesFormOpen(true);
  };

  // Función para cargar transacciones con detalles completos
  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error de autenticación",
          description: "No estás autenticado. Por favor, inicia sesión de nuevo.",
          variant: "destructive"
        });
        throw new Error('No hay token de autenticación');
      }
      
      const data = await API_CONFIG.fetchApi('/api/transactions?limit=10');
      setTransactions(data.transactions);
      
    } catch (err) {
      console.error("Error al cargar transacciones:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Mostrar mensaje de error específico para problemas de autenticación
      if (errorMessage.includes('Token') || errorMessage.includes('token')) {
        toast({
          title: "Error de autenticación",
          description: "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones recientes",
          variant: "destructive"
        });
      }
    }
  };

  // Función para cargar el resumen financiero
  const loadFinanceSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error de autenticación",
          description: "No estás autenticado. Por favor, inicia sesión de nuevo.",
          variant: "destructive"
        });
        throw new Error('No hay token de autenticación');
      }
      
      const data = await API_CONFIG.fetchApi('/api/finance/summary');
      
      // Procesar los datos
      setFinanceSummary(data);
      
      // Preparar categorías con porcentajes calculados
      const processedCategories = data.categorias.map(cat => {
        // Calcular porcentaje basado en gastos vs presupuesto
        const percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
        
        return {
          id: cat.id,
          name: cat.name,
          budget: cat.budget,
          spent: cat.spent,
          income: cat.income || 0, // Ingresos por categoría
          color: cat.color || getCategoryDefaultColor(cat.name),
          percentage: percentage
        };
      });
      
      // Asegurarse de que todas las categorías predefinidas estén presentes
      const expectedCategories = ['Comida', 'Transporte', 'Entretenimiento', 'Ahorro'];
      const hasAllCategories = expectedCategories.every(catName => 
        processedCategories.some(cat => cat.name === catName)
      );

      if (!hasAllCategories && processedCategories.length > 0) {
        console.log("No se encontraron todas las categorías predefinidas, recargando...");
        // Intentar cargar categorías explícitamente si falta alguna
        try {
          const categoriesData = await API_CONFIG.fetchApi('/api/categories');
          
          // Crear un mapa para buscar rápidamente gastos por categoría
          const spentByCategory = {};
          processedCategories.forEach(cat => {
            spentByCategory[cat.name] = cat.spent;
          });
          
          // Actualizar con todas las categorías, preservando gastos si existen
          const updatedCategories = categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            budget: cat.budget,
            spent: spentByCategory[cat.name] || 0,
            color: cat.color || getCategoryDefaultColor(cat.name),
            percentage: cat.budget > 0 ? ((spentByCategory[cat.name] || 0) / cat.budget) * 100 : 0
          }));
          
          setCategories(updatedCategories);
          return; // Salir temprano para evitar el setCategories abajo
        } catch (err) {
          console.error("Error al cargar categorías adicionales:", err);
        }
      }

      setCategories(processedCategories);
      
      // Establecer la meta de ahorro principal (si existe)
      if (data.metas_ahorro && data.metas_ahorro.length > 0) {
        setSavingsGoal(data.metas_ahorro[0]);
      }
      
      // Cargar transacciones recientes
      await loadTransactions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos financieros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFinanceSummary();
  }, []);

  // Forzar la creación de categorías por defecto si no hay categorías
  useEffect(() => {
    if (!loading && categories.length === 0) {
      // Si no hay categorías después de cargar, intentar obtenerlas específicamente
      const fetchCategories = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No hay token de autenticación');
          }
          
          const response = await fetch(API_CONFIG.getApiUrl('/api/categories'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const categoriesData = await response.json();
            // Mapear y añadir valores por defecto de gastos
            const processedCategories = categoriesData.map(cat => ({
              id: cat.id,
              name: cat.name,
              budget: cat.budget,
              spent: 0, // Por defecto sin gastos
              percentage: 0, // Por defecto 0%
              color: cat.color
            }));
            
            setCategories(processedCategories);
          }
        } catch (err) {
          console.error("Error al cargar categorías:", err);
        }
      };
      
      fetchCategories();
    }
  }, [loading, categories]);

  // Función para agregar un nuevo gasto
  const addExpense = async (data: { category_id: number, amount: number, description: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      await API_CONFIG.fetchApi('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          type: 'gasto',
          date: new Date().toISOString()
        })
      });
      
      toast({
        title: "Gasto registrado",
        description: "El gasto ha sido registrado exitosamente",
      });
      
      // Recargar los datos financieros
      loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };
  
  // Función para agregar un nuevo ingreso
  const addIncome = async (data: { category_id: number, amount: number, description: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Registrar ingreso usando la categoría seleccionada
      const response = await fetch(API_CONFIG.getApiUrl('/api/transactions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: data.category_id,
          amount: data.amount,
          description: data.description,
          type: 'ingreso',
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al registrar el ingreso');
      }
      
      toast({
        title: "Ingreso registrado",
        description: "El ingreso ha sido registrado exitosamente",
      });
      
      // Recargar los datos financieros
      await loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };
  
  // Función para crear una nueva meta de ahorro
  const createSavingsGoal = async (data: { name: string, target_amount: number, current_amount: number, target_date: string | null }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl('/api/savings/goals'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la meta de ahorro');
      }
      
      toast({
        title: "Meta creada",
        description: "La meta de ahorro ha sido creada exitosamente",
      });
      
      // Recargar los datos financieros
      loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };
  
  // Función para actualizar una meta de ahorro
  const updateSavingsGoal = async (goalId: number, newAmount: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/savings/goals/${goalId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_amount: newAmount
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la meta de ahorro');
      }
      
      toast({
        title: "Meta actualizada",
        description: "La meta de ahorro ha sido actualizada exitosamente",
      });
      
      // Recargar los datos financieros
      loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };

  // Filtrar y agrupar categorías
  const categoriesGrouped = getCategoryGroups(categories);
  const filteredCategories = activeTab === "todas" 
    ? categories.filter(cat => !cat.name.toLowerCase().includes('ingreso'))
    : categoriesGrouped[activeTab] || [];

  // Función para abrir el formulario de edición de presupuesto
  const openBudgetForm = (category: Category) => {
    setSelectedCategory(category);
    setIsBudgetFormOpen(true);
  };

  // Función para actualizar solo el presupuesto de una categoría
  const updateCategoryBudget = async (categoryId: number, budget: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/categories/${categoryId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ budget })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el presupuesto');
      }
      
      toast({
        title: "Meta establecida",
        description: "El presupuesto ha sido actualizado exitosamente",
      });
      
      // Recargar los datos financieros
      loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };

  // Función para actualizar una categoría (nombre y presupuesto)
  const updateCategory = async (categoryId: number, name: string, budget: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(API_CONFIG.getApiUrl(`/api/categories/${categoryId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, budget })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }
      
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
      
      // Recargar los datos financieros
      loadFinanceSummary();
      
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: "destructive"
      });
    }
  };

  // Función auxiliar para obtener colores predeterminados por categoría
  const getCategoryDefaultColor = (categoryName: string): string => {
    const defaultColors = {
      'Comida': 'green',
      'Transporte': 'blue',
      'Entretenimiento': 'purple',
      'Ahorro': 'teal',
      'Ingreso': 'gray'
    };
    
    return defaultColors[categoryName] || 'gray';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Finanzas Personales</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-green-200 text-green-700"
            onClick={openIncomeForm}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo ingreso
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={openExpenseForm}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <p>Cargando datos financieros...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={loadFinanceSummary}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Balance total</span>
                  <span className="text-2xl font-bold">${financeSummary?.balance_total.toFixed(2)}</span>
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
                  <span className="text-2xl font-bold">${financeSummary?.gastos_mes.toFixed(2)}</span>
              <span className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" /> 
                    {financeSummary?.variacion_gastos.toFixed(1)}% desde el mes pasado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Ingresos del mes</span>
                  <span className="text-2xl font-bold">${financeSummary?.ingresos_mes.toFixed(2)}</span>
              <span className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> 
                    {financeSummary?.variacion_ingresos.toFixed(1)}% desde el mes pasado
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-green-100">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <span className="text-sm text-green-700 font-medium">Meta de ahorro</span>
                  <span className="text-2xl font-bold">
                    ${savingsGoal?.current_amount.toFixed(2) || '0.00'} / ${savingsGoal?.target_amount.toFixed(2) || '0.00'}
                  </span>
              <div className="w-full mt-2">
                    <Progress 
                      value={savingsGoal ? (savingsGoal.current_amount / savingsGoal.target_amount) * 100 : 0} 
                      className="h-2 bg-green-100" 
                    />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget categories and transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
              {/* Categorías de presupuesto - Con botones para establecer metas */}
          <Card>
                <CardHeader className="pb-2">
                  <div>
              <CardTitle>Categorías de presupuesto</CardTitle>
              <CardDescription>Progreso por categoría en el mes actual</CardDescription>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-6">
                    {categories.length > 0 ? (
                      categories
                        .filter(cat => !cat.name.toLowerCase().includes('ingreso'))
                        .map((category) => (
                          <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}</span>
                                {category.income > 0 && (
                                  <span className="text-xs text-green-600">(+${category.income.toFixed(2)})</span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-5 w-5 p-0 text-gray-500 hover:text-green-700"
                                  onClick={() => openBudgetForm(category)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              </div>
                    </div>
                    <Progress 
                              value={Math.min(category.percentage, 100)} 
                      className={`h-2 ${
                        category.percentage > 100 
                          ? "bg-red-100" 
                          : category.percentage > 80 
                            ? "bg-yellow-100" 
                            : "bg-green-100"
                      }`} 
                              style={{
                                background: category.percentage > 100 
                                  ? 'rgba(254, 226, 226, 0.5)' 
                                  : category.percentage > 80 
                                    ? 'rgba(254, 249, 195, 0.5)'
                                    : 'rgba(220, 252, 231, 0.5)',
                                '--tw-progress-fill': category.percentage > 100 
                                  ? 'rgba(239, 68, 68, 0.8)' 
                                  : category.percentage > 80 
                                    ? 'rgba(234, 179, 8, 0.8)'
                                    : 'rgba(22, 163, 74, 0.8)',
                              } as React.CSSProperties} 
                            />
                            {category.percentage > 100 && (
                              <div className="text-xs text-red-500 mt-1">
                                Has superado el presupuesto en ${(category.spent - category.budget).toFixed(2)}
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      // Mostrar mensaje de carga o categorías no disponibles
                      <div className="p-4 text-center">
                        {loading ? (
                          <p>Cargando categorías...</p>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-500">No hay categorías disponibles.</p>
                            <Button 
                              onClick={() => loadFinanceSummary()} 
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Recargar categorías
                            </Button>
                          </div>
                        )}
                  </div>
                    )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Últimas transacciones</CardTitle>
              <CardDescription>Movimientos recientes en tus cuentas</CardDescription>
            </CardHeader>
            <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded border border-green-100 bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaction.type === 'ingreso' 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                              {transaction.type === 'ingreso' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                                {transaction.category_name} • {transaction.formatted_date || new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span 
                      className={`font-medium ${
                              transaction.type === 'ingreso' ? "text-green-600" : "text-red-500"
                      }`}
                    >
                            {transaction.type === 'ingreso' ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
                  </ScrollArea>
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
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-green-800">Gastas un 25% más en comida a domicilio que el mes pasado.</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-green-800">Tu categoría de ahorro ha alcanzado su meta por 3 meses consecutivos. ¡Felicidades!</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-sm text-green-800">Considera reducir gastos en entretenimiento para mantener tu presupuesto.</p>
                  </div>
              </div>
            </CardContent>
          </Card>
          
              {savingsGoal ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Meta de ahorro</CardTitle>
                    <CardDescription>{savingsGoal.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                          <span className="font-medium">
                            {((savingsGoal.current_amount / savingsGoal.target_amount) * 100).toFixed(0)}%
                          </span>
                  </div>
                        <Progress 
                          value={(savingsGoal.current_amount / savingsGoal.target_amount) * 100} 
                          className="h-3 bg-green-100" 
                        />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Ahorrado</span>
                        <span className="font-medium">${savingsGoal.current_amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Objetivo</span>
                        <span className="font-medium">${savingsGoal.target_amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Fecha objetivo</span>
                        <span className="font-medium">
                          {savingsGoal.target_date ? new Date(savingsGoal.target_date).toLocaleDateString() : 'No definida'}
                        </span>
                </div>
                
                      <Button 
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        onClick={() => setIsAddToGoalFormOpen(true)}
                      >
                  Añadir fondos a meta
                </Button>
              </div>
            </CardContent>
          </Card>
              ) : (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Meta de ahorro</CardTitle>
                    <CardDescription>No tienes metas de ahorro</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setIsSavingsGoalFormOpen(true)}
                    >
                      Crear meta de ahorro
                    </Button>
                  </CardContent>
                </Card>
              )}
        </div>
      </div>
        </>
      )}
      
      {/* Formularios */}
      <TransactionForm
        isOpen={isIncomeFormOpen}
        onClose={() => setIsIncomeFormOpen(false)}
        onSubmit={addIncome}
        type="ingreso"
        categories={categories}
      />
      
      <TransactionForm
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={addExpense}
        type="gasto"
        categories={categories}
      />
      
      <SavingsGoalForm
        isOpen={isSavingsGoalFormOpen}
        onClose={() => setIsSavingsGoalFormOpen(false)}
        onSubmit={createSavingsGoal}
        mode="create"
      />
      
      {savingsGoal && (
        <SavingsGoalForm
          isOpen={isAddToGoalFormOpen}
          onClose={() => setIsAddToGoalFormOpen(false)}
          onSubmit={(data) => updateSavingsGoal(savingsGoal.id, data.current_amount)}
          initialData={savingsGoal}
          mode="add"
        />
      )}
      
      {/* Añadir formulario de presupuesto */}
      <CategoryBudgetForm 
        isOpen={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
        onSubmit={updateCategoryBudget}
        category={selectedCategory}
      />
    </div>
  );
};

export default FinanceModule;
