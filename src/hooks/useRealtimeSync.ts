
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, Payment } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeSyncProps {
  onProjectsUpdate: (projects: Project[]) => void;
  onPaymentsUpdate: (payments: Payment[]) => void;
  enabled?: boolean;
}

export const useRealtimeSync = ({ 
  onProjectsUpdate, 
  onPaymentsUpdate, 
  enabled = true 
}: UseRealtimeSyncProps) => {
  const { toast } = useToast();

  const handleProjectChange = useCallback(async (payload: any) => {
    console.log('Project real-time update:', payload);
    
    // Fetch fresh project data and update local state
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform from database schema to app schema
      const transformedProjects: Project[] = (data || []).map((project: any) => ({
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
      
      onProjectsUpdate(transformedProjects);
      
      // Show notification for updates from other users
      const { data: { user } } = await supabase.auth.getUser();
      if (payload.eventType !== 'INSERT' || payload.new?.user_id !== user?.id) {
        toast({
          title: "Project Updated",
          description: "A project has been updated by another user.",
        });
      }
    } catch (error) {
      console.error('Failed to fetch updated projects:', error);
    }
  }, [onProjectsUpdate, toast]);

  const handlePaymentChange = useCallback(async (payload: any) => {
    console.log('Payment real-time update:', payload);
    
    // Fetch fresh payment data and update local state
    try {
      const { data, error } = await (supabase as any)
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform from database schema to app schema
      const transformedPayments: Payment[] = (data || []).map((payment: any) => ({
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
      
      onPaymentsUpdate(transformedPayments);
      
      // Show notification for updates from other users
      const { data: { user } } = await supabase.auth.getUser();
      if (payload.eventType !== 'INSERT' || payload.new?.user_id !== user?.id) {
        toast({
          title: "Payment Updated",
          description: "A payment has been updated by another user.",
        });
      }
    } catch (error) {
      console.error('Failed to fetch updated payments:', error);
    }
  }, [onPaymentsUpdate, toast]);

  useEffect(() => {
    if (!enabled) return;

    console.log('Setting up real-time subscriptions...');
    
    // Subscribe to projects table changes
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        handleProjectChange
      )
      .subscribe();

    // Subscribe to payments table changes
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        handlePaymentChange
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [enabled, handleProjectChange, handlePaymentChange]);

  return {
    // Return any utility functions if needed
  };
};
