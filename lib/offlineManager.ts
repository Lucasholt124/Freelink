// Gerenciador de Vendas Offline usando IndexedDB
import { openDB, IDBPDatabase } from 'idb';

// interface OfflineDB extends DBSchema {
//   sales: {
//     key: string;
//     value: { ... };
//     indexes: { 'synced': boolean; 'timestamp': number }; // ISSO CAUSA O ERRO
//   };
//   ...
// }

// ✅ CORREÇÃO TS: Usar a definição canônica da DBSchema.
// O tipo do valor (value) deve ser definido diretamente nas chaves (sales, expenses).

// Definindo o tipo de Valor (Value Type)
type OfflineSaleValue = {
  id: string;
  costPrice: number;
  salePrice: number;
  description: string;
  paymentMethod: string;
  date: string;
  timestamp: number;
  synced: 0 | 1; // 0 para false, 1 para true
};

type OfflineExpenseValue = {
  id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  date: string;
  timestamp: number;
  synced: 0 | 1; // 0 para false, 1 para true
};

// Definindo a estrutura da DBSchema
interface OfflineDB {
  sales: {
    key: string;
    value: OfflineSaleValue;
    // Map: Nome do Índice -> Tipo do Campo Indexado no 'value'
    indexes: { 'synced': number; 'timestamp': number };
  };
  expenses: {
    key: string;
    value: OfflineExpenseValue;
    // Map: Nome do Índice -> Tipo do Campo Indexado no 'value'
    indexes: { 'synced': number; 'timestamp': number };
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
          // Cast para ServiceWorkerRegistration com a propriedade 'sync'
          const syncRegistration = registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } };
           
          window.addEventListener('online', () => {
            syncRegistration.sync.register('sync-sales');
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

  async saveSaleOffline(sale: Omit<OfflineSaleValue, 'id' | 'timestamp' | 'synced'>) {
    if (!this.db) await this.init();

    const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   
    await this.db!.add('sales', {
      id,
      ...sale,
      timestamp: Date.now(),
      synced: 0, // Usar 0 para false
    });

    console.log('💾 Venda salva offline:', id);
    return id;
  }

  async saveExpenseOffline(expense: Omit<OfflineExpenseValue, 'id' | 'timestamp' | 'synced'>) {
    if (!this.db) await this.init();

    const id = `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
   
    await this.db!.add('expenses', {
      id,
      ...expense,
      timestamp: Date.now(),
      synced: 0, // Usar 0 para false
    });

    console.log('💾 Gasto salvo offline:', id);
    return id;
  }

  // O segundo argumento é a chave do índice, agora tipado corretamente na interface OfflineDB.
  async getUnsyncedSales() {
    if (!this.db) await this.init();
    const sales = await this.db!.getAllFromIndex('sales', 'synced', 0);
    return sales;
  }

  // O segundo argumento é a chave do índice, agora tipado corretamente na interface OfflineDB.
  async getUnsyncedExpenses() {
    if (!this.db) await this.init();
    const expenses = await this.db!.getAllFromIndex('expenses', 'synced', 0);
    return expenses;
  }

  async markAsSynced(type: 'sales' | 'expenses', id: string) {
    if (!this.db) await this.init();
    const record = await this.db!.get(type, id);
    if (record) {
      record.synced = 1; // Usar 1 para true
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