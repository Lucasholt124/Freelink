// Gerenciador de Vendas Offline usando IndexedDB
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  sales: {
    key: string;
    value: {
      id: string;
      costPrice: number;
      salePrice: number;
      description: string;
      paymentMethod: string;
      date: string;
      timestamp: number;
      synced: boolean;
    };
  };
  expenses: {
    key: string;
    value: {
      id: string;
      amount: number;
      description: string;
      category: string;
      paymentMethod: string;
      date: string;
      timestamp: number;
      synced: boolean;
    };
  };
}

class OfflineManager {
  private db: IDBPDatabase<OfflineDB> | null = null;
  private syncCallbacks: Array<() => void> = [];

  async init() {
    this.db = await openDB<OfflineDB>('gestao-pro-offline', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('synced', 'synced');
          salesStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('expenses')) {
          const expensesStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expensesStore.createIndex('synced', 'synced');
          expensesStore.createIndex('timestamp', 'timestamp');
        }
      },
    });

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado:', registration);

        // Background Sync
        if ('sync' in registration) {
          window.addEventListener('online', () => {
            registration.sync.register('sync-sales');
          });
        }
      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
      }
    }

    // Listener de conexão
    window.addEventListener('online', () => {
      console.log('🌐 Conexão restaurada! Sincronizando...');
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Sem conexão. Modo offline ativado.');
    });
  }

  async saveSaleOffline(sale: {
    costPrice: number;
    salePrice: number;
    description: string;
    paymentMethod: string;
    date: string;
  }) {
    if (!this.db) await this.init();

    const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db!.add('sales', {
      id,
      ...sale,
      timestamp: Date.now(),
      synced: false,
    });

    console.log('💾 Venda salva offline:', id);
    return id;
  }

  async saveExpenseOffline(expense: {
    amount: number;
    description: string;
    category: string;
    paymentMethod: string;
    date: string;
  }) {
    if (!this.db) await this.init();

    const id = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db!.add('expenses', {
      id,
      ...expense,
      timestamp: Date.now(),
      synced: false,
    });

    console.log('💾 Gasto salvo offline:', id);
    return id;
  }

  async getUnsyncedSales() {
    if (!this.db) await this.init();
    const sales = await this.db!.getAllFromIndex('sales', 'synced', false);
    return sales;
  }

  async getUnsyncedExpenses() {
    if (!this.db) await this.init();
    const expenses = await this.db!.getAllFromIndex('expenses', 'synced', false);
    return expenses;
  }

  async markAsSynced(type: 'sales' | 'expenses', id: string) {
    if (!this.db) await this.init();
    const record = await this.db!.get(type, id);
    if (record) {
      record.synced = true;
      await this.db!.put(type, record);
    }
  }

  async deleteRecord(type: 'sales' | 'expenses', id: string) {
    if (!this.db) await this.init();
    await this.db!.delete(type, id);
  }

  async syncAll() {
    try {
      const sales = await this.getUnsyncedSales();
      const expenses = await this.getUnsyncedExpenses();

      console.log(`🔄 Sincronizando ${sales.length} vendas e ${expenses.length} gastos...`);

      // Notificar callbacks (React usará isso para chamar a API)
      this.syncCallbacks.forEach(cb => cb());

      return { sales, expenses };
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      throw error;
    }
  }

  onSync(callback: () => void) {
    this.syncCallbacks.push(callback);
  }

  async getPendingCount() {
    const sales = await this.getUnsyncedSales();
    const expenses = await this.getUnsyncedExpenses();
    return { sales: sales.length, expenses: expenses.length, total: sales.length + expenses.length };
  }

  isOnline() {
    return navigator.onLine;
  }
}

export const offlineManager = new OfflineManager();

