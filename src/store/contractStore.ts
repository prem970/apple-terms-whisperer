import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface Contract {
  id: string;
  file_name: string;
  brand_id: string | null;
  series_id: string | null;
  model: string | null;
  version: string;
  upload_date: string;
  expiry_date: string;
  status: 'active' | 'expiring' | 'expired';
  uploaded_by: string | null;
  file_size: string | null;
  document_type: 'commission' | 'service' | 'license';
  risk_level: 'low' | 'medium' | 'high' | null;
  margin: string | null;
  payment_terms: string | null;
  sla_time: string | null;
  territory: string | null;
  exclusivity: boolean | null;
  minimum_order_quantity: string | null;
  warranty_period: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Alert {
  id: string;
  type: 'expiry' | 'risk' | 'update';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string | null;
  contract_id: string | null;
  user_id: string | null;
  is_read: boolean | null;
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
  created_at: string;
}

interface Series {
  id: string;
  brand_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
}

interface ContractComparison {
  id: string;
  contract1_id: string;
  contract2_id: string;
  comparison_date: string;
  compared_by: string | null;
  changes: any;
  summary: string | null;
}

interface ContractState {
  contracts: Contract[];
  alerts: Alert[];
  brands: Brand[];
  series: Series[];
  comparisons: ContractComparison[];
  selectedContract: Contract | null;
  selectedContracts: Contract[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchContracts: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchSeries: () => Promise<void>;
  uploadContract: (file: File) => Promise<void>;
  selectContract: (contract: Contract | null) => void;
  toggleContractSelection: (contract: Contract) => void;
  compareContracts: (contract1Id: string, contract2Id: string) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  searchContracts: (query: string) => Contract[];
  getContractsByBrand: (brandId: string) => Contract[];
  getContractsBySeries: (seriesId: string) => Contract[];
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  alerts: [],
  brands: [],
  series: [],
  comparisons: [],
  selectedContract: null,
  selectedContracts: [],
  loading: false,
  error: null,
  
  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ contracts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchAlerts: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ alerts: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  fetchBrands: async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ brands: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  fetchSeries: async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ series: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  uploadContract: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Parse file name to extract brand and model info
      const fileName = file.name.toLowerCase();
      let brandName = 'Unknown';
      let seriesName = 'Unknown';
      let model = 'Standard';
      let documentType: 'commission' | 'service' | 'license' = 'commission';
      
      // Detect brand from filename
      if (fileName.includes('iphone')) {
        brandName = 'Apple';
        const iphoneMatch = fileName.match(/iphone\s*(\d+)/i);
        if (iphoneMatch) {
          seriesName = `iPhone ${iphoneMatch[1]}`;
        }
        if (fileName.includes('pro max')) {
          model = 'Pro Max';
        } else if (fileName.includes('pro')) {
          model = 'Pro';
        } else if (fileName.includes('plus')) {
          model = 'Plus';
        }
      } else if (fileName.includes('galaxy')) {
        brandName = 'Samsung';
        if (fileName.includes('s2') || fileName.includes('s3')) {
          seriesName = 'Galaxy S Series';
        } else if (fileName.includes(' a')) {
          seriesName = 'Galaxy A Series';
        } else if (fileName.includes(' z')) {
          seriesName = 'Galaxy Z Series';
        }
        if (fileName.includes('ultra')) {
          model = 'Ultra';
        } else if (fileName.includes('plus')) {
          model = 'Plus';
        }
      }
      
      // Detect document type
      if (fileName.includes('commission')) {
        documentType = 'commission';
      } else if (fileName.includes('service')) {
        documentType = 'service';
      } else if (fileName.includes('license')) {
        documentType = 'license';
      }
      
      // Get brand and series IDs
      const { brands, series } = get();
      const brand = brands.find(b => b.name === brandName);
      const seriesItem = series.find(s => s.name === seriesName && s.brand_id === brand?.id);
      
      // Generate random key terms
      const margins = ['8%', '10%', '12%', '15%', '18%'];
      const paymentTerms = ['30 days', '45 days', '60 days', '90 days'];
      const slaTimes = ['12 hours', '24 hours', '36 hours', '48 hours'];
      const territories = ['1 state', '2 states', '3 states', 'Regional', 'National'];
      
      const randomMargin = margins[Math.floor(Math.random() * margins.length)];
      const randomPayment = paymentTerms[Math.floor(Math.random() * paymentTerms.length)];
      const randomSLA = slaTimes[Math.floor(Math.random() * slaTimes.length)];
      const randomTerritory = territories[Math.floor(Math.random() * territories.length)];
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      const marginValue = parseInt(randomMargin);
      const paymentDays = parseInt(randomPayment);
      
      if (marginValue >= 12 && paymentDays <= 45) {
        riskLevel = 'low';
      } else if (marginValue < 10 || paymentDays >= 90) {
        riskLevel = 'high';
      }
      
      // Create contract in database
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          file_name: file.name,
          brand_id: brand?.id || null,
          series_id: seriesItem?.id || null,
          model,
          version: '2025.1',
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          uploaded_by: user.id,
          file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          document_type: documentType,
          risk_level: riskLevel,
          margin: randomMargin,
          payment_terms: randomPayment,
          sla_time: randomSLA,
          territory: randomTerritory,
          exclusivity: Math.random() > 0.5,
          minimum_order_quantity: `${Math.floor(Math.random() * 200 + 50)} units`,
          warranty_period: documentType === 'service' ? '24 months' : '12 months'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      set((state) => ({
        contracts: [data, ...state.contracts],
        loading: false
      }));
      
      // Create alert for new contract
      await supabase
        .from('alerts')
        .insert({
          type: 'update',
          severity: 'low',
          title: 'New Contract Uploaded',
          description: `Contract ${file.name} has been uploaded successfully`,
          contract_id: data.id,
          user_id: user.id
        });
      
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  selectContract: (contract) => {
    set({ selectedContract: contract });
  },
  
  toggleContractSelection: (contract) => {
    set((state) => {
      const isSelected = state.selectedContracts.some(c => c.id === contract.id);
      if (isSelected) {
        return {
          selectedContracts: state.selectedContracts.filter(c => c.id !== contract.id)
        };
      } else if (state.selectedContracts.length < 2) {
        return {
          selectedContracts: [...state.selectedContracts, contract]
        };
      }
      return state;
    });
  },
  
  compareContracts: async (contract1Id: string, contract2Id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { contracts } = get();
      const contract1 = contracts.find(c => c.id === contract1Id);
      const contract2 = contracts.find(c => c.id === contract2Id);
      
      if (!contract1 || !contract2) return;
      
      // Generate comparison
      const changes = {
        margin: {
          old: contract1.margin,
          new: contract2.margin,
          type: parseFloat(contract2.margin || '0') > parseFloat(contract1.margin || '0') ? 'improvement' : 'concern'
        },
        payment_terms: {
          old: contract1.payment_terms,
          new: contract2.payment_terms,
          type: 'neutral'
        },
        sla_time: {
          old: contract1.sla_time,
          new: contract2.sla_time,
          type: parseFloat(contract2.sla_time || '0') < parseFloat(contract1.sla_time || '0') ? 'improvement' : 'concern'
        },
        territory: {
          old: contract1.territory,
          new: contract2.territory,
          type: 'neutral'
        }
      };
      
      const { data, error } = await supabase
        .from('contract_comparisons')
        .insert({
          contract1_id: contract1Id,
          contract2_id: contract2Id,
          compared_by: user.id,
          changes,
          summary: `Comparing ${contract1.file_name} with ${contract2.file_name}`
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        comparisons: [...state.comparisons, data]
      }));
      
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  markAlertAsRead: async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  searchContracts: (query: string) => {
    const { contracts } = get();
    const lowerQuery = query.toLowerCase();
    return contracts.filter(contract => 
      contract.file_name.toLowerCase().includes(lowerQuery) ||
      contract.model?.toLowerCase().includes(lowerQuery) ||
      contract.version.toLowerCase().includes(lowerQuery)
    );
  },
  
  getContractsByBrand: (brandId: string) => {
    const { contracts } = get();
    return contracts.filter(contract => contract.brand_id === brandId);
  },
  
  getContractsBySeries: (seriesId: string) => {
    const { contracts } = get();
    return contracts.filter(contract => contract.series_id === seriesId);
  }
}));