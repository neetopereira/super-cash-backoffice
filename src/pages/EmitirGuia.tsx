import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Copy, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generatePDF } from '@/lib/pdfGenerator';

export default function EmitirGuia() {
  const navigate = useNavigate();
  const { clients, addContract, addPaymentGuide } = useStore();
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientCpf: '',
    loanValue: '',
    parcelas: '1',
    juros: '0',
    pixCode: '',
  });

  const loanValue = parseFloat(formData.loanValue) || 0;
  const juros = parseFloat(formData.juros) || 0;
  const parcelas = parseInt(formData.parcelas) || 1;
  const totalValue = loanValue * (1 + juros / 100);
  const parcelaValue = totalValue / parcelas;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePixCode = () => {
    const code = `SUPERCASH${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setFormData({ ...formData, pixCode: code });
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(formData.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contractId = `CTR-${Date.now()}`;
    const guideId = `GUI-${Date.now()}`;
    const clientId = `CLI-${Date.now()}`;

    // Create contract
    addContract({
      id: contractId,
      clientId,
      clientName: formData.clientName,
      loanValue,
      parcelas,
      juros,
      totalValue,
      pixCode: formData.pixCode,
      status: 'active',
      createdAt: new Date(),
    });

    // Create payment guide
    const guide = {
      id: guideId,
      contractId,
      clientId,
      clientName: formData.clientName,
      clientCpf: formData.clientCpf,
      value: totalValue,
      pixCode: formData.pixCode,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    addPaymentGuide(guide);

    // Generate PDF
    await generatePDF(guide);

    // Navigate to arrecadacao
    navigate('/arrecadacao');
  };

  const isValid = formData.clientName && formData.clientCpf && loanValue > 0 && formData.pixCode;

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Emitir Guia de Pagamento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registre os dados do contrato e gere a guia de pagamento
        </p>
      </div>

      <div className="accent-line" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Section */}
        <div className="bg-card border border-border p-5">
          <h2 className="section-header">Dados do Cliente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="form-input"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="form-label">CPF</label>
              <input
                type="text"
                name="clientCpf"
                value={formData.clientCpf}
                onChange={handleChange}
                className="form-input"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </div>

        {/* Contract Section */}
        <div className="bg-card border border-border p-5">
          <h2 className="section-header">Dados do Contrato</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Valor do Empréstimo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <input
                  type="number"
                  name="loanValue"
                  value={formData.loanValue}
                  onChange={handleChange}
                  className="form-input pl-10"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Parcelas</label>
              <select
                name="parcelas"
                value={formData.parcelas}
                onChange={handleChange}
                className="form-input"
              >
                {[1, 2, 3, 4, 5, 6, 12, 24, 36, 48].map((n) => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Juros (%)</label>
              <input
                type="number"
                name="juros"
                value={formData.juros}
                onChange={handleChange}
                className="form-input"
                placeholder="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Calculated Values */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div className="bg-secondary p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Valor Total</div>
              <div className="text-xl font-semibold text-foreground mt-1">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-secondary p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Valor da Parcela</div>
              <div className="text-xl font-semibold text-foreground mt-1">
                R$ {parcelaValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* PIX Section */}
        <div className="bg-card border border-border p-5">
          <h2 className="section-header">Código PIX</h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                name="pixCode"
                value={formData.pixCode}
                onChange={handleChange}
                className="form-input font-mono text-sm"
                placeholder="Código PIX único"
              />
              {formData.pixCode && (
                <button
                  type="button"
                  onClick={copyPixCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={generatePixCode}
              className="btn-secondary"
            >
              Gerar Código
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Código único associado a esta guia de pagamento
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4 mr-2" />
            GERAR GUIA DE PAGAMENTO
          </button>
        </div>
      </form>
    </div>
  );
}
