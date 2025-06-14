
export interface Project {
  id: string;
  address: string;
  finalPrice: number;
  vatRate: number;
  status: "Pending" | "In Progress" | "Completed";
  currency: "GBP" | "USD" | "EUR";
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  notes?: string;
  totalReceived: number;
  totalRemaining: number;
  lastPayment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  stage: string;
  date: Date;
  invoice: number;
  invoiceWithVAT: number;
  transfer: number;
  cash: number;
  vat: number;
  total: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  status: string;
  minAmount: string;
  maxAmount: string;
  dateFrom: string;
  dateTo: string;
}

export * from './toast';
