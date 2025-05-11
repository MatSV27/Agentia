import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardBot from "./pages/dashboard/DashboardBot";
import FinanceModule from "./components/modules/FinanceModule";
import HabitModule from "./components/modules/HabitModule";
import WellbeingModule from "./components/modules/WellbeingModule";
import CalendarModule from "./components/modules/CalendarModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Dashboard con subrutas */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="bot" element={<DashboardBot />} />
            <Route path="habits" element={<HabitModule />} />
            <Route path="finance" element={<FinanceModule />} />
            <Route path="wellbeing" element={<WellbeingModule />} />
            <Route path="calendar" element={<CalendarModule />} />
          </Route>
          
          {/* Rutas adicionales */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/bot" element={<Chatbot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
