import { useState } from 'react';
import { Check, FileText, Download } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generatePDF } from '@/lib/pdfGenerator';

export default function Arrecadacao() {
  const { paymentGuides, confirmPayment } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const filteredGuides = paymentGuides.filter((g) => {
    if (filter === 'pending') return g.status === 'pending';
    if (filter === 'confirmed') return g.status === 'confirmed';
    return true;
  });

  const sortedGuides = [...filteredGuides].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingTotal = paymentGuides
    .filter((g) => g.status === 'pending')
    .reduce((sum, g) => sum + g.value, 0);

  const confirmedTotal = paymentGuides
    .filter((g) => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Arrecadação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Confirmação manual de pagamentos
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Pendente</div>
            <div className="text-lg font-semibold text-warning">
              R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Confirmado</div>
            <div className="text-lg font-semibold text-success">
              R$ {confirmedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="accent-line" />

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'confirmed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn-secondary ${filter === f ? 'bg-accent border-primary/30 text-primary' : ''}`}
          >
            {f === 'all' && 'Todas'}
            {f === 'pending' && 'Pendentes'}
            {f === 'confirmed' && 'Confirmadas'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border">
        {sortedGuides.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">
              Nenhuma guia registrada
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Emita uma guia de pagamento para começar
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Valor</th>
                <th>Código PIX</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedGuides.map((guide) => (
                <tr key={guide.id}>
                  <td className="font-mono text-xs">{guide.id.slice(0, 12)}</td>
                  <td>{guide.clientName}</td>
                  <td className="font-mono text-xs text-muted-foreground">{guide.clientCpf}</td>
                  <td className="font-mono font-medium">
                    R$ {guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {guide.pixCode.slice(0, 16)}...
                  </td>
                  <td className="text-muted-foreground text-xs">
                    {format(new Date(guide.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td>
                    <span className={guide.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                      {guide.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {guide.status === 'pending' && (
                        <button
                          onClick={() => confirmPayment(guide.id)}
                          className="btn-secondary py-1.5 px-2"
                          title="Confirmar pagamento"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => generatePDF(guide)}
                        className="btn-secondary py-1.5 px-2"
                        title="Baixar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
