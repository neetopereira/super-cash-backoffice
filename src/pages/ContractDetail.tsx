import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Check, 
  Clock, 
  CircleDollarSign,
  FileStack,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generatePDF } from '@/lib/pdfGenerator';
import { cn } from '@/lib/utils';

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const contract = useStore((s) => s.getContractById(id || ''));
  const guides = useStore((s) => s.getGuidesByContractId(id || ''));
  const auditEvents = useStore((s) => s.getAuditEventsByContractId(id || ''));
  const { confirmPayment, updateContractStatus } = useStore();

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mt-3">Contrato não encontrado</p>
          <button onClick={() => navigate('/contratos')} className="btn-secondary mt-4">
            Voltar para Contratos
          </button>
        </div>
      </div>
    );
  }

  const sortedGuides = [...guides].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const sortedEvents = [...auditEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPaid = guides
    .filter((g) => g.status === 'confirmed')
    .reduce((sum, g) => sum + g.value, 0);

  const totalPending = guides
    .filter((g) => g.status === 'pending')
    .reduce((sum, g) => sum + g.value, 0);

  // Generate payment schedule based on parcelas
  const paymentSchedule = Array.from({ length: contract.parcelas }, (_, i) => {
    const parcelaValue = contract.totalValue / contract.parcelas;
    const dueDate = addMonths(new Date(contract.createdAt), i + 1);
    const paidGuide = guides.find(
      (g) => g.status === 'confirmed' && Math.abs(g.value - parcelaValue) < 0.01
    );
    
    return {
      parcela: i + 1,
      value: parcelaValue,
      dueDate,
      status: paidGuide ? 'paid' : new Date() > dueDate ? 'overdue' : 'pending',
      paidAt: paidGuide?.confirmedAt,
    };
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'contract_created':
        return <FileStack className="w-4 h-4 text-primary" />;
      case 'guide_emitted':
        return <FileText className="w-4 h-4 text-muted-foreground" />;
      case 'payment_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'status_changed':
        return <History className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/contratos')}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                Contrato {contract.id}
              </h1>
              <span className={cn(
                contract.status === 'active' && 'badge-active',
                contract.status === 'completed' && 'badge-confirmed',
                contract.status === 'cancelled' && 'badge-pending'
              )}>
                {contract.status === 'active' && 'Ativo'}
                {contract.status === 'completed' && 'Finalizado'}
                {contract.status === 'cancelled' && 'Cancelado'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {contract.clientName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {contract.status === 'active' && (
            <>
              <button
                onClick={() => updateContractStatus(contract.id, 'completed')}
                className="btn-secondary"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalizar
              </button>
              <button
                onClick={() => updateContractStatus(contract.id, 'cancelled')}
                className="btn-secondary text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/emitir')}
            className="btn-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nova Guia
          </button>
        </div>
      </div>

      <div className="accent-line" />

      {/* Contract Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Valor Empréstimo</div>
          <div className="text-xl font-semibold mt-1">
            R$ {contract.loanValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Juros</div>
          <div className="text-xl font-semibold mt-1">{contract.juros}%</div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Parcelas</div>
          <div className="text-xl font-semibold mt-1">{contract.parcelas}x</div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total</div>
          <div className="text-xl font-semibold mt-1 text-primary">
            R$ {contract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-card border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Data Criação</div>
          <div className="text-xl font-semibold mt-1">
            {format(new Date(contract.createdAt), "dd/MM/yy", { locale: ptBR })}
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-card border border-border p-5">
        <h3 className="section-header mb-4">Progresso de Pagamento</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Arrecadado</span>
              <span className="font-medium text-success">
                R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${Math.min((totalPaid / contract.totalValue) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground">
              <span>{((totalPaid / contract.totalValue) * 100).toFixed(1)}% do total</span>
              <span>Meta: R$ {contract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="border-l border-border pl-6">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Pendente</div>
            <div className="text-xl font-semibold text-warning mt-1">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Payment Schedule */}
        <div className="bg-card border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cronograma de Pagamento
            </h3>
            <span className="text-xs text-muted-foreground">
              {contract.parcelas} parcelas
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {paymentSchedule.map((item) => (
              <div 
                key={item.parcela}
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    item.status === 'paid' && "bg-success/10 text-success",
                    item.status === 'pending' && "bg-secondary text-muted-foreground",
                    item.status === 'overdue' && "bg-destructive/10 text-destructive"
                  )}>
                    {item.parcela}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Parcela {item.parcela}/{contract.parcelas}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Venc. {format(item.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">
                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={cn(
                    "text-xs",
                    item.status === 'paid' && "text-success",
                    item.status === 'pending' && "text-muted-foreground",
                    item.status === 'overdue' && "text-destructive"
                  )}>
                    {item.status === 'paid' && 'Pago'}
                    {item.status === 'pending' && 'Pendente'}
                    {item.status === 'overdue' && 'Vencido'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-card border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Histórico de Auditoria
            </h3>
            <span className="text-xs text-muted-foreground">
              {sortedEvents.length} eventos
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {sortedEvents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                
                {sortedEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="relative flex gap-4 px-4 py-3"
                  >
                    <div className="relative z-10 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{event.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(event.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Guides */}
      <div className="bg-card border border-border">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Guias de Pagamento Associadas
          </h3>
          <span className="text-xs text-muted-foreground">
            {guides.length} guias
          </span>
        </div>
        
        {sortedGuides.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">
              Nenhuma guia emitida para este contrato
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Valor</th>
                <th>Código PIX</th>
                <th>Emissão</th>
                <th>Confirmação</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedGuides.map((guide) => (
                <tr key={guide.id}>
                  <td className="font-mono text-xs">{guide.id}</td>
                  <td className="font-mono font-medium">
                    R$ {guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="font-mono text-xs text-muted-foreground">
                    {guide.pixCode.slice(0, 20)}...
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {format(new Date(guide.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {guide.confirmedAt 
                      ? format(new Date(guide.confirmedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : '—'
                    }
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

      {/* PIX Code Reference */}
      <div className="bg-card border border-border p-5">
        <h3 className="section-header mb-3">Código PIX do Contrato</h3>
        <div className="flex items-center gap-4">
          <code className="flex-1 bg-secondary px-4 py-3 font-mono text-sm break-all">
            {contract.pixCode}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(contract.pixCode)}
            className="btn-secondary"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
}
