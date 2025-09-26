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
    // Parse file name to extract brand, series, and document type
    const fileName = file.name.toLowerCase();
    let brand = 'Unknown';
    let series = 'Unknown';
    let model = 'Standard';
    let documentType: 'commission' | 'service' | 'license' = 'commission';
    
    // Detect brand from filename
    if (fileName.includes('iphone')) {
      brand = 'Apple';
      // Extract iPhone series number
      const iphoneMatch = fileName.match(/iphone\s*(\d+)/i);
      if (iphoneMatch) {
        series = `iPhone ${iphoneMatch[1]}`;
      }
      // Check for model variants
      if (fileName.includes('pro max')) {
        model = 'Pro Max';
      } else if (fileName.includes('pro')) {
        model = 'Pro';
      } else if (fileName.includes('plus')) {
        model = 'Plus';
      }
    } else if (fileName.includes('realme')) {
      brand = 'Realme';
      const realmeMatch = fileName.match(/realme\s*(\d+)/i);
      if (realmeMatch) {
        series = `Realme ${realmeMatch[1]}`;
      }
      if (fileName.includes('pro')) {
        model = 'Pro+';
      }
    } else if (fileName.includes('samsung') || fileName.includes('galaxy')) {
      brand = 'Samsung';
      if (fileName.includes('s2')) {
        const sMatch = fileName.match(/s(\d+)/i);
        if (sMatch) {
          series = `Galaxy S${sMatch[1]}`;
        }
      } else if (fileName.includes('note')) {
        series = 'Galaxy Note';
      } else {
        series = 'Galaxy';
      }
      if (fileName.includes('ultra')) {
        model = 'Ultra';
      } else if (fileName.includes('plus')) {
        model = 'Plus';
      }
    } else if (fileName.includes('oneplus')) {
      brand = 'OnePlus';
      const oneplusMatch = fileName.match(/oneplus\s*(\d+)/i);
      if (oneplusMatch) {
        series = `OnePlus ${oneplusMatch[1]}`;
      }
      if (fileName.includes('pro')) {
        model = 'Pro';
      }
    } else if (fileName.includes('xiaomi') || fileName.includes('redmi')) {
      brand = fileName.includes('redmi') ? 'Redmi' : 'Xiaomi';
      if (fileName.includes('note')) {
        series = 'Note Series';
      } else if (fileName.includes('mi')) {
        const miMatch = fileName.match(/mi\s*(\d+)/i);
        if (miMatch) {
          series = `Mi ${miMatch[1]}`;
        }
      }
    }
    
    // Detect document type
    if (fileName.includes('commission')) {
      documentType = 'commission';
    } else if (fileName.includes('service')) {
      documentType = 'service';
    } else if (fileName.includes('license') || fileName.includes('distribution')) {
      documentType = 'license';
    }
    
    // Extract year from filename for version
    const yearMatch = fileName.match(/20\d{2}/);
    const version = yearMatch ? `${yearMatch[0]}.1` : '2025.1';
    
    // Generate random but realistic key terms based on brand and document type
    const margins = ['8%', '10%', '12%', '15%', '18%'];
    const paymentTerms = ['30 days', '45 days', '60 days', '90 days'];
    const slaTimes = ['12 hours', '24 hours', '36 hours', '48 hours'];
    const territories = ['1 state', '2 states', '3 states', 'Regional', 'National'];
    
    const randomMargin = margins[Math.floor(Math.random() * margins.length)];
    const randomPayment = paymentTerms[Math.floor(Math.random() * paymentTerms.length)];
    const randomSLA = slaTimes[Math.floor(Math.random() * slaTimes.length)];
    const randomTerritory = territories[Math.floor(Math.random() * territories.length)];
    
    // Determine risk level based on margin and payment terms
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    const marginValue = parseInt(randomMargin);
    const paymentDays = parseInt(randomPayment);
    
    if (marginValue >= 12 && paymentDays <= 45) {
      riskLevel = 'low';
    } else if (marginValue < 10 || paymentDays >= 90) {
      riskLevel = 'high';
    }
    
    // Simulate file upload and processing
    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      fileName: file.name,
      brand,
      series,
      model,
      version,
      uploadDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      uploadedBy: 'Current User',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      documentType,
      keyTerms: {
        margin: randomMargin,
        paymentTerms: randomPayment,
        slaTime: randomSLA,
        territory: randomTerritory,
        exclusivity: Math.random() > 0.5,
        minimumOrderQuantity: `${Math.floor(Math.random() * 200 + 50)} units`,
        warrantyPeriod: documentType === 'service' ? '24 months' : '12 months'
      },
      riskLevel
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