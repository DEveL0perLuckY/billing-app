import AsyncStorage from '@react-native-async-storage/async-storage';
import {InvoiceCreationData} from './types';

const PENDING_INVOICES_KEY = '@pending_invoices';

export interface PendingInvoice {
  localId: string;
  userId: string;
  data: InvoiceCreationData;
  timestamp: number;
}

export const offlineStorage = {
  savePendingInvoice: async (
    userId: string,
    invoiceData: InvoiceCreationData,
  ): Promise<PendingInvoice> => {
    try {
      const pendingInvoicesJSON = await AsyncStorage.getItem(
        PENDING_INVOICES_KEY,
      );
      const pendingInvoices: PendingInvoice[] = pendingInvoicesJSON
        ? JSON.parse(pendingInvoicesJSON)
        : [];

      const newPendingInvoice: PendingInvoice = {
        localId: `local_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        userId,
        data: invoiceData,
        timestamp: Date.now(),
      };

      pendingInvoices.push(newPendingInvoice);
      await AsyncStorage.setItem(
        PENDING_INVOICES_KEY,
        JSON.stringify(pendingInvoices),
      );
      return newPendingInvoice;
    } catch (error) {
      console.error('Error saving pending invoice:', error);
      throw error;
    }
  },

  getPendingInvoices: async (): Promise<PendingInvoice[]> => {
    try {
      const pendingInvoicesJSON = await AsyncStorage.getItem(
        PENDING_INVOICES_KEY,
      );
      return pendingInvoicesJSON ? JSON.parse(pendingInvoicesJSON) : [];
    } catch (error) {
      console.error('Error getting pending invoices:', error);
      return [];
    }
  },

  removePendingInvoice: async (localId: string): Promise<void> => {
    try {
      const pendingInvoicesJSON = await AsyncStorage.getItem(
        PENDING_INVOICES_KEY,
      );
      if (!pendingInvoicesJSON) return;

      const pendingInvoices: PendingInvoice[] = JSON.parse(pendingInvoicesJSON);
      const updatedInvoices = pendingInvoices.filter(
        inv => inv.localId !== localId,
      );

      await AsyncStorage.setItem(
        PENDING_INVOICES_KEY,
        JSON.stringify(updatedInvoices),
      );
    } catch (error) {
      console.error('Error removing pending invoice:', error);
    }
  },

  clearAllPendingInvoices: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PENDING_INVOICES_KEY);
    } catch (error) {
      console.error('Error clearing pending invoices:', error);
    }
  },
};
