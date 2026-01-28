import { Wallet, FileText, FileStack, AlertCircle } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useStore } from '@/store/useStore';

export default function Dashboard() {
  const getStats = useStore((s) => s.getStats);
  const stats = getStats();

  const formatCurrency = (value: number) => {
    if (value === 0) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das operações
        </p>
      </div>

      {/* Accent Line */}
      <div className="accent-line" />

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Total Arrecadado"
          value={formatCurrency(stats.totalArrecadado)}
          prefix="R$"
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          label="Guias Emitidas"
          value={stats.guiasEmitidas}
          icon={FileText}
        />
        <KPICard
          label="Contratos Ativos"
          value={stats.contratosAtivos}
          icon={FileStack}
        />
        <KPICard
          label="Pendências"
          value={stats.pendenciasConfirmacao}
          icon={AlertCircle}
          variant={stats.pendenciasConfirmacao > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity />

      {/* System Status */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>Sistema operacional</span>
        </div>
        <div>
          Armazenamento local ativo
        </div>
        <div className="ml-auto font-mono">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
