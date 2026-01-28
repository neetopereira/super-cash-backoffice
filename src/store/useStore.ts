import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Client, Contract, PaymentGuide, DashboardStats, AuditEvent } from '@/types';

interface AppState {
  clients: Client[];
  contracts: Contract[];
  paymentGuides: PaymentGuide[];
  auditEvents: AuditEvent[];
  
  // Actions
  addClient: (client: Client) => void;
  addContract: (contract: Contract) => void;
  addPaymentGuide: (guide: PaymentGuide) => void;
  confirmPayment: (guideId: string) => void;
  addAuditEvent: (event: Omit<AuditEvent, 'id' | 'createdAt'>) => void;
  updateContractStatus: (contractId: string, status: Contract['status']) => void;
  
  // Computed
  getStats: () => DashboardStats;
  getClientById: (id: string) => Client | undefined;
  getContractById: (id: string) => Contract | undefined;
  getGuidesByContractId: (contractId: string) => PaymentGuide[];
  getAuditEventsByContractId: (contractId: string) => AuditEvent[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: [],
      contracts: [],
      paymentGuides: [],
      auditEvents: [],

      addClient: (client) =>
        set((state) => ({ clients: [...state.clients, client] })),

      addContract: (contract) => {
        set((state) => ({ contracts: [...state.contracts, contract] }));
        // Add audit event
        get().addAuditEvent({
          contractId: contract.id,
          type: 'contract_created',
          description: `Contrato criado para ${contract.clientName}`,
          metadata: {
            loanValue: contract.loanValue,
            parcelas: contract.parcelas,
            juros: contract.juros,
            totalValue: contract.totalValue,
          },
        });
      },

      addPaymentGuide: (guide) => {
        set((state) => ({ paymentGuides: [...state.paymentGuides, guide] }));
        // Add audit event
        get().addAuditEvent({
          contractId: guide.contractId,
          type: 'guide_emitted',
          description: `Guia de pagamento emitida - R$ ${guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          metadata: {
            guideId: guide.id,
            value: guide.value,
            pixCode: guide.pixCode,
          },
        });
      },

      confirmPayment: (guideId) => {
        const guide = get().paymentGuides.find((g) => g.id === guideId);
        set((state) => ({
          paymentGuides: state.paymentGuides.map((g) =>
            g.id === guideId
              ? { ...g, status: 'confirmed' as const, confirmedAt: new Date() }
              : g
          ),
        }));
        if (guide) {
          get().addAuditEvent({
            contractId: guide.contractId,
            type: 'payment_confirmed',
            description: `Pagamento confirmado - R$ ${guide.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            metadata: {
              guideId: guide.id,
              value: guide.value,
            },
          });
        }
      },

      addAuditEvent: (event) =>
        set((state) => ({
          auditEvents: [
            ...state.auditEvents,
            {
              ...event,
              id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              createdAt: new Date(),
            },
          ],
        })),

      updateContractStatus: (contractId, status) => {
        const contract = get().contracts.find((c) => c.id === contractId);
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === contractId ? { ...c, status } : c
          ),
        }));
        if (contract) {
          get().addAuditEvent({
            contractId,
            type: 'status_changed',
            description: `Status alterado para ${status === 'active' ? 'Ativo' : status === 'completed' ? 'Finalizado' : 'Cancelado'}`,
            metadata: { previousStatus: contract.status, newStatus: status },
          });
        }
      },

      getStats: () => {
        const state = get();
        const confirmedGuides = state.paymentGuides.filter(
          (g) => g.status === 'confirmed'
        );
        const pendingGuides = state.paymentGuides.filter(
          (g) => g.status === 'pending'
        );
        const activeContracts = state.contracts.filter(
          (c) => c.status === 'active'
        );

        return {
          totalArrecadado: confirmedGuides.reduce((sum, g) => sum + g.value, 0),
          guiasEmitidas: state.paymentGuides.length,
          contratosAtivos: activeContracts.length,
          pendenciasConfirmacao: pendingGuides.length,
        };
      },

      getClientById: (id) => get().clients.find((c) => c.id === id),
      getContractById: (id) => get().contracts.find((c) => c.id === id),
      getGuidesByContractId: (contractId) =>
        get().paymentGuides.filter((g) => g.contractId === contractId),
      getAuditEventsByContractId: (contractId) =>
        get().auditEvents.filter((e) => e.contractId === contractId),
    }),
    {
      name: 'supercash-storage',
    }
  )
);
