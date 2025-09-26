import { motion } from "framer-motion";
import { FileText, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contract } from "@/types";
import { format } from "date-fns";

interface ContractCardProps {
  contract: Contract;
  onSelect: (contract: Contract) => void;
  onChat: (contract: Contract) => void;
}

export function ContractCard({ contract, onSelect, onChat }: ContractCardProps) {
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'expiring': return 'bg-warning text-warning-foreground';
      case 'expired': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk?: Contract['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const StatusIcon = contract.status === 'active' ? CheckCircle : 
                      contract.status === 'expiring' ? Clock : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all cursor-pointer bg-gradient-card border-border/50 hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm line-clamp-1">{contract.fileName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{contract.brand}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-medium text-primary">{contract.series}</span>
                  {contract.model && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{contract.model}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(contract.status)} text-xs`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {contract.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {contract.keyTerms && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {contract.keyTerms.margin && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="font-semibold text-primary">{contract.keyTerms.margin}</span>
                </div>
              )}
              {contract.keyTerms.slaTime && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">SLA:</span>
                  <span className="font-medium">{contract.keyTerms.slaTime}</span>
                </div>
              )}
              {contract.keyTerms.territory && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Territory:</span>
                  <span className="font-medium">{contract.keyTerms.territory}</span>
                </div>
              )}
              {contract.keyTerms.paymentTerms && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium">{contract.keyTerms.paymentTerms}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Expires {format(contract.expiryDate, 'MMM dd, yyyy')}</span>
              </div>
              {contract.riskLevel && (
                <Badge variant="outline" className={`text-xs ${getRiskColor(contract.riskLevel)}`}>
                  {contract.riskLevel} risk
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(contract);
              }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-gradient-primary"
              onClick={(e) => {
                e.stopPropagation();
                onChat(contract);
              }}
            >
              AI Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}