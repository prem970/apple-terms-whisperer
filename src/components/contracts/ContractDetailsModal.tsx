import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Contract } from "@/types";
import { Calendar, FileText, MapPin, CreditCard, Shield, AlertTriangle, Building } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ContractDetailsModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractDetailsModal({ contract, isOpen, onClose }: ContractDetailsModalProps) {
  if (!contract) return null;

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'expiring': return 'bg-warning/10 text-warning border-warning/20';
      case 'expired': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  const getRiskColor = (risk?: Contract['riskLevel']) => {
    switch (risk) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Contract Details
          </DialogTitle>
          <DialogDescription>
            Complete information about the contract agreement
          </DialogDescription>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-6"
        >
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {contract.fileName}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-xs">
                  <Building className="h-3 w-3 mr-1" />
                  {contract.brand}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Series: {contract.series} | Model: {contract.model}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStatusColor(contract.status)}>
                {contract.status.toUpperCase()}
              </Badge>
              {contract.riskLevel && (
                <Badge className={getRiskColor(contract.riskLevel)}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {contract.riskLevel.toUpperCase()} RISK
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Key Terms Section */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Key Contract Terms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-medium">Commission Margin</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{contract.keyTerms?.margin || '12%'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Distributor commission rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-medium">Service Level Agreement</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{contract.keyTerms?.slaTime || '24h'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Repair turnaround time
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-medium">Territory Rights</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{contract.keyTerms?.territory || '2 states'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Authorized selling regions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary/60" />
                    <span className="text-sm font-medium">Payment Terms</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{contract.keyTerms?.paymentTerms || '30 days'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment due period
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Summary Section */}
          <div>
            <h4 className="font-semibold mb-3 text-primary">Contract Summary</h4>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-foreground/90">
                  This {contract.documentType} agreement for {contract.brand} {contract.series} Series ({contract.model}) 
                  establishes a {contract.keyTerms?.margin || '12%'} commission margin for distributors. The contract includes 
                  a {contract.keyTerms?.slaTime || '24 hours'} service level agreement for repairs and warranty support. 
                  Distribution rights are granted for {contract.keyTerms?.territory || '2 states'} with {contract.keyTerms?.paymentTerms || '30 days'} payment terms.
                  {contract.status === 'expiring' && (
                    <span className="text-warning font-medium">
                      {' '}This contract expires on {format(contract.expiryDate, 'MMMM dd, yyyy')} and requires immediate attention for renewal.
                    </span>
                  )}
                  {contract.status === 'expired' && (
                    <span className="text-destructive font-medium">
                      {' '}This contract expired on {format(contract.expiryDate, 'MMMM dd, yyyy')}. A new agreement is required to continue operations.
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <div>
            <h4 className="font-semibold mb-3 text-primary">Additional Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type:</span>
                <span className="font-medium capitalize">{contract.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">{contract.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload Date:</span>
                <span className="font-medium">{format(contract.uploadDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry Date:</span>
                <span className="font-medium">{format(contract.expiryDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Until Expiry:</span>
                <span className="font-medium">
                  {Math.ceil((contract.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          {contract.riskLevel && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Analysis
                </h4>
                <Card className={`${getRiskColor(contract.riskLevel)} border`}>
                  <CardContent className="p-4">
                    <p className="text-sm">
                      {contract.riskLevel === 'high' && (
                        "This contract has high-risk clauses that require immediate review. Consider renegotiating terms or seeking legal counsel."
                      )}
                      {contract.riskLevel === 'medium' && (
                        "This contract contains moderate risk factors. Review penalty clauses and ensure compliance with all terms."
                      )}
                      {contract.riskLevel === 'low' && (
                        "This contract has minimal risk factors. Standard terms are favorable for business operations."
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}