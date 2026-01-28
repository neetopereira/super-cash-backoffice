import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import EmitirGuia from "./pages/EmitirGuia";
import Arrecadacao from "./pages/Arrecadacao";
import Clientes from "./pages/Clientes";
import Contratos from "./pages/Contratos";
import ContractDetail from "./pages/ContractDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/emitir" element={<EmitirGuia />} />
            <Route path="/arrecadacao" element={<Arrecadacao />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/contratos/:id" element={<ContractDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;