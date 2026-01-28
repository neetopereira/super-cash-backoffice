// Super Cash - Core Types

export interface Client {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  clientCpf?: string;
  loanValue: number;
  parcelas: number;
  juros: number;
  totalValue: number;
  pixCode: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface PaymentGuide {
  id: string;
  contractId: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  value: number;
  pixCode: string;
  status: 'pending' | 'confirmed';
  confirmedAt?: Date;
  createdAt: Date;
}

export interface AuditEvent {
  id: string;
  contractId: string;
  type: 'contract_created' | 'guide_emitted' | 'payment_confirmed' | 'status_changed';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DashboardStats {
  totalArrecadado: number;
  guiasEmitidas: number;
  contratosAtivos: number;
  pendenciasConfirmacao: number;
}

export interface PaymentScheduleItem {
  parcela: number;
  value: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
}
