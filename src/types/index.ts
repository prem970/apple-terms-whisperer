export type UserRole = 'distributor_head' | 'store_incharge' | 'salesperson';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  location?: string;
}

export interface Contract {
  id: string;
  fileName: string;
  brand: string;
  series: string;
  model: string;
  version: string;
  uploadDate: Date;
  expiryDate: Date;
  status: 'active' | 'expiring' | 'expired';
  uploadedBy: string;
  fileSize: string;
  documentType: 'commission' | 'service' | 'license';
  keyTerms?: KeyTerms;
  riskLevel?: 'low' | 'medium' | 'high';
  changes?: ContractChange[];
}

export interface KeyTerms {
  margin?: string;
  paymentTerms?: string;
  slaTime?: string;
  territory?: string;
  exclusivity?: boolean;
  minimumOrderQuantity?: string;
  warrantyPeriod?: string;
}

export interface ContractChange {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: 'improvement' | 'neutral' | 'concern';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  contractId?: string;
  highlightedClause?: string;
}

export interface Alert {
  id: string;
  type: 'expiry' | 'risk' | 'update';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  contractId: string;
  date: Date;
  isRead: boolean;
}

export interface ComparisonResult {
  contract1: Contract;
  contract2: Contract;
  changes: ContractChange[];
  summary: string;
}