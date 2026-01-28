import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Contratos() {
  const navigate = useNavigate();
  const contracts = useStore((s) => s.contracts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.includes(search);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedContracts = [...filteredContracts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Contratos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todos os contratos registrados no sistema
        </p>
      </div>

      <div className="accent-line" />

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou ID..."
            className="form-input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn-secondary ${statusFilter === s ? 'bg-accent border-primary/30 text-primary' : ''}`}
            >
              {s === 'all' && 'Todos'}
              {s === 'active' && 'Ativos'}
              {s === 'completed' && 'Finalizados'}
              {s === 'cancelled' && 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border">
        {sortedContracts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {contracts.length === 0 ? 'Nenhum contrato registrado' : 'Nenhum resultado encontrado'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Valor Empréstimo</th>
                <th>Parcelas</th>
                <th>Juros</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedContracts.map((contract) => (
                <tr 
                  key={contract.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/contratos/${contract.id}`)}
                >
                  <td className="font-mono text-xs">{contract.id.slice(0, 12)}</td>
                  <td className="font-medium">{contract.clientName}</td>
                  <td className="font-mono">
                    R$ {contract.loanValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>{contract.parcelas}x</td>
                  <td>{contract.juros}%</td>
                  <td className="font-mono font-medium">
                    R$ {contract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={
                      contract.status === 'active' ? 'badge-active' :
                      contract.status === 'completed' ? 'badge-confirmed' :
                      'badge-pending'
                    }>
                      {contract.status === 'active' && 'Ativo'}
                      {contract.status === 'completed' && 'Finalizado'}
                      {contract.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </td>
                  <td className="text-muted-foreground text-xs">
                    {format(new Date(contract.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contratos/${contract.id}`);
                      }}
                      className="btn-secondary py-1.5 px-2"
                      title="Ver detalhes"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}