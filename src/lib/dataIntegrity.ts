
import { Project, Payment, Client } from "@/types";

// Generate simple checksum for data validation
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

// Secure localStorage operations with integrity checks
export class SecureStorage {
  static setItem(key: string, data: any): void {
    try {
      const serialized = JSON.stringify(data);
      const checksum = generateChecksum(serialized);
      const payload = {
        data: serialized,
        checksum,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save data:', error);
      throw new Error('Data save failed');
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const payload = JSON.parse(stored);
      if (!payload.data || !payload.checksum) {
        console.warn('Data integrity check failed: missing checksum');
        return null;
      }

      const expectedChecksum = generateChecksum(payload.data);
      if (payload.checksum !== expectedChecksum) {
        console.error('Data integrity check failed: checksum mismatch');
        return null;
      }

      return JSON.parse(payload.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Backup functionality
  static exportData(): string {
    const projects = this.getItem<Project[]>('projects') || [];
    const payments = this.getItem<Payment[]>('payments') || [];
    
    const backup = {
      projects,
      payments,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    return JSON.stringify(backup, null, 2);
  }

  static importData(backupData: string): { success: boolean; message: string } {
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.projects || !backup.payments) {
        return { success: false, message: 'Invalid backup format' };
      }

      this.setItem('projects', backup.projects);
      this.setItem('payments', backup.payments);
      
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import data: ' + error };
    }
  }
}
