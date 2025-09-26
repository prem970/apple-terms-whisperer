import { create } from 'zustand';
import { Contract, Alert, ChatMessage } from '@/types';
import { mockContracts, mockAlerts } from '@/data/mockData';

interface ContractState {
  contracts: Contract[];
  alerts: Alert[];
  chatMessages: ChatMessage[];
  selectedContract: Contract | null;
  uploadContract: (file: File) => Promise<void>;
  selectContract: (contract: Contract | null) => void;
  markAlertAsRead: (alertId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  searchContracts: (query: string) => Contract[];
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: mockContracts,
  alerts: mockAlerts,
  chatMessages: [],
  selectedContract: null,
  
  uploadContract: async (file: File) => {
    // Simulate file upload and processing
    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      fileName: file.name,
      brand: 'Apple',
      series: 'iPhone 17',
      model: 'Pro Max',
      version: '2025.1',
      uploadDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      uploadedBy: 'Current User',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      documentType: 'commission',
      keyTerms: {
        margin: '12%',
        paymentTerms: '30 days',
        slaTime: '12 hours',
        territory: '2 states',
        exclusivity: true,
        minimumOrderQuantity: '100 units',
        warrantyPeriod: '24 months'
      },
      riskLevel: 'low'
    };
    
    set((state) => ({
      contracts: [newContract, ...state.contracts]
    }));
  },
  
  selectContract: (contract) => {
    set({ selectedContract: contract });
  },
  
  markAlertAsRead: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    }));
  },
  
  addChatMessage: (message) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message]
    }));
  },
  
  searchContracts: (query) => {
    const contracts = get().contracts;
    const lowerQuery = query.toLowerCase();
    return contracts.filter(contract => 
      contract.fileName.toLowerCase().includes(lowerQuery) ||
      contract.brand.toLowerCase().includes(lowerQuery) ||
      contract.series.toLowerCase().includes(lowerQuery) ||
      contract.model.toLowerCase().includes(lowerQuery)
    );
  }
}));