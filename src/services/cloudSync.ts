
import { supabase } from '@/integrations/supabase/client';
import { Project, Payment } from '@/types';

export class CloudSyncService {
  // Projects
  static async syncProjectsToCloud(projects: Project[], userId: string) {
    try {
      // Transform projects to match database schema
      const projectsToSync = projects.map(project => ({
        id: project.id,
        user_id: userId,
        address: project.address,
        final_price: project.finalPrice,
        vat_rate: project.vatRate,
        status: project.status,
        currency: project.currency,
        client_name: project.clientName || null,
        client_email: project.clientEmail || null,
        client_phone: project.clientPhone || null,
        client_address: project.clientAddress || null,
        notes: project.notes || null,
        total_received: project.totalReceived,
        total_remaining: project.totalRemaining,
        last_payment: project.lastPayment,
        created_at: project.createdAt,
        deleted_at: project.deletedAt || null
      }));

      const { error } = await (supabase as any)
        .from('projects')
        .upsert(projectsToSync, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to sync projects to cloud:', error);
      return { success: false, error };
    }
  }

  static async syncProjectsFromCloud(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Transform from database schema to app schema
      return (data || []).map((project: any) => ({
        id: project.id,
        address: project.address,
        finalPrice: project.final_price,
        vatRate: project.vat_rate,
        status: project.status,
        currency: project.currency,
        clientName: project.client_name,
        clientEmail: project.client_email,
        clientPhone: project.client_phone,
        clientAddress: project.client_address,
        notes: project.notes,
        totalReceived: project.total_received,
        totalRemaining: project.total_remaining,
        lastPayment: project.last_payment,
        createdAt: project.created_at,
        deletedAt: project.deleted_at
      }));
    } catch (error) {
      console.error('Failed to sync projects from cloud:', error);
      return [];
    }
  }

  // Payments
  static async syncPaymentsToCloud(payments: Payment[], userId: string) {
    try {
      const paymentsToSync = payments.map(payment => ({
        id: payment.id,
        user_id: userId,
        project_id: payment.projectId,
        stage: payment.stage,
        date: payment.date,
        invoice: payment.invoice,
        invoice_with_vat: payment.invoiceWithVAT,
        transfer: payment.transfer,
        cash: payment.cash,
        vat: payment.vat,
        total: payment.total,
        created_at: payment.createdAt
      }));

      const { error } = await (supabase as any)
        .from('payments')
        .upsert(paymentsToSync, { onConflict: 'id' });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Failed to sync payments to cloud:', error);
      return { success: false, error };
    }
  }

  static async syncPaymentsFromCloud(userId: string): Promise<Payment[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('payments')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((payment: any) => ({
        id: payment.id,
        projectId: payment.project_id,
        stage: payment.stage,
        date: new Date(payment.date),
        invoice: payment.invoice,
        invoiceWithVAT: payment.invoice_with_vat,
        transfer: payment.transfer,
        cash: payment.cash,
        vat: payment.vat,
        total: payment.total,
        createdAt: payment.created_at
      }));
    } catch (error) {
      console.error('Failed to sync payments from cloud:', error);
      return [];
    }
  }

  // Full sync operations
  static async performFullSync(projects: Project[], payments: Payment[], userId: string) {
    try {
      // Sync projects
      const projectSync = await this.syncProjectsToCloud(projects, userId);
      if (!projectSync.success) throw projectSync.error;

      // Sync payments
      const paymentSync = await this.syncPaymentsToCloud(payments, userId);
      if (!paymentSync.success) throw paymentSync.error;

      return { success: true };
    } catch (error) {
      console.error('Full sync failed:', error);
      return { success: false, error };
    }
  }

  static async loadFromCloud(userId: string) {
    try {
      const [projects, payments] = await Promise.all([
        this.syncProjectsFromCloud(userId),
        this.syncPaymentsFromCloud(userId)
      ]);

      return { success: true, projects, payments };
    } catch (error) {
      console.error('Failed to load from cloud:', error);
      return { success: false, projects: [], payments: [], error };
    }
  }
}
