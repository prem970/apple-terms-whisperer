import { Contract, Alert } from '@/types';

export const mockContracts: Contract[] = [
  {
    id: 'contract-1',
    fileName: 'iPhone16_Commission_Agreement_2024.pdf',
    brand: 'Apple',
    series: 'iPhone 16',
    model: 'Pro Max',
    version: '2024.2',
    uploadDate: new Date('2024-01-15'),
    expiryDate: new Date('2025-01-15'),
    status: 'active',
    uploadedBy: 'John Anderson',
    fileSize: '2.4 MB',
    documentType: 'commission',
    keyTerms: {
      margin: '10%',
      paymentTerms: '60 days',
      slaTime: '24 hours',
      territory: '1 state',
      exclusivity: false,
      minimumOrderQuantity: '150 units',
      warrantyPeriod: '12 months'
    },
    riskLevel: 'low',
    changes: []
  },
  {
    id: 'contract-2',
    fileName: 'iPhone17_Commission_Agreement_2025.pdf',
    brand: 'Apple',
    series: 'iPhone 17',
    model: 'Pro Max',
    version: '2025.1',
    uploadDate: new Date('2025-01-01'),
    expiryDate: new Date('2026-01-01'),
    status: 'active',
    uploadedBy: 'Sarah Chen',
    fileSize: '2.8 MB',
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
    riskLevel: 'low',
    changes: [
      { field: 'Margin', oldValue: '10%', newValue: '12%', changeType: 'improvement' },
      { field: 'Payment Terms', oldValue: '60 days', newValue: '30 days', changeType: 'improvement' },
      { field: 'SLA Time', oldValue: '24 hours', newValue: '12 hours', changeType: 'improvement' },
      { field: 'Territory', oldValue: '1 state', newValue: '2 states', changeType: 'improvement' }
    ]
  },
  {
    id: 'contract-3',
    fileName: 'iPhone16_Service_Agreement_2024.pdf',
    brand: 'Apple',
    series: 'iPhone 16',
    model: 'All Models',
    version: '2024.1',
    uploadDate: new Date('2024-02-01'),
    expiryDate: new Date('2025-02-28'),
    status: 'expiring',
    uploadedBy: 'Mike Wilson',
    fileSize: '1.8 MB',
    documentType: 'service',
    keyTerms: {
      slaTime: '48 hours',
      warrantyPeriod: '12 months',
      territory: 'California'
    },
    riskLevel: 'medium'
  },
  {
    id: 'contract-4',
    fileName: 'Realme11_Distribution_License_2024.pdf',
    brand: 'Realme',
    series: 'Realme 11',
    model: 'Pro+',
    version: '2024.3',
    uploadDate: new Date('2024-03-15'),
    expiryDate: new Date('2024-12-31'),
    status: 'expiring',
    uploadedBy: 'John Anderson',
    fileSize: '3.1 MB',
    documentType: 'license',
    keyTerms: {
      margin: '15%',
      paymentTerms: '45 days',
      territory: 'West Coast',
      exclusivity: true,
      minimumOrderQuantity: '200 units'
    },
    riskLevel: 'high'
  },
  {
    id: 'contract-5',
    fileName: 'iPhone15_Commission_Agreement_2023.pdf',
    brand: 'Apple',
    series: 'iPhone 15',
    model: 'Pro',
    version: '2023.4',
    uploadDate: new Date('2023-09-20'),
    expiryDate: new Date('2024-09-20'),
    status: 'expired',
    uploadedBy: 'Sarah Chen',
    fileSize: '2.2 MB',
    documentType: 'commission',
    keyTerms: {
      margin: '9%',
      paymentTerms: '90 days',
      slaTime: '36 hours',
      territory: '1 state'
    },
    riskLevel: 'low'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'expiry',
    severity: 'high',
    title: 'iPhone 16 Service Agreement Expiring Soon',
    description: 'Service agreement expires in 30 days. Renewal action required.',
    contractId: 'contract-3',
    date: new Date(),
    isRead: false
  },
  {
    id: 'alert-2',
    type: 'risk',
    severity: 'high',
    title: 'High Risk Clause Detected',
    description: 'Realme 11 distribution license contains penalty clauses that may impact profitability.',
    contractId: 'contract-4',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false
  },
  {
    id: 'alert-3',
    type: 'update',
    severity: 'medium',
    title: 'New iPhone 17 Agreement Available',
    description: 'Updated commission structure with improved margins detected.',
    contractId: 'contract-2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true
  },
  {
    id: 'alert-4',
    type: 'expiry',
    severity: 'medium',
    title: 'Realme 11 License Expires in 60 Days',
    description: 'Distribution license renewal needed by Dec 31, 2024.',
    contractId: 'contract-4',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: false
  }
];