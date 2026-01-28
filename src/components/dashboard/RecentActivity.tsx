import { useStore } from '@/store/useStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RecentActivity() {
  const paymentGuides = useStore((s) => s.paymentGuides);
  const recentGuides = [...paymentGuides]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card border border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Atividade Recente
        </h3>
      </div>
      
      {recentGuides.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            As guias emitidas aparecerão aqui
          </p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {recentGuides.map((guide) => (
              <tr key={guide.id}>
                <td className="font-mono text-xs">{guide.id.slice(0, 8)}</td>
                <td>{guide.clientName}</td>
                <td className="font-mono">
                  R$ {guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <span className={guide.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>
                    {guide.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </td>
                <td className="text-muted-foreground">
                  {format(new Date(guide.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
