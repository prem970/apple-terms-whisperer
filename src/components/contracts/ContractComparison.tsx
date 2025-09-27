import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useContractStore } from '@/store/contractStore';
import { cn } from '@/lib/utils';

interface ContractComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractComparison = ({ isOpen, onClose }: ContractComparisonProps) => {
  const { selectedContracts, compareContracts } = useContractStore();
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleCompare = async () => {
    if (selectedContracts.length !== 2) return;
    
    setLoading(true);
    await compareContracts(selectedContracts[0].id, selectedContracts[1].id);
    
    // Generate comparison data
    const changes = {
      margin: {
        old: selectedContracts[0].margin,
        new: selectedContracts[1].margin,
        change: getChangeType(selectedContracts[0].margin, selectedContracts[1].margin, 'higher')
      },
      payment_terms: {
        old: selectedContracts[0].payment_terms,
        new: selectedContracts[1].payment_terms,
        change: getChangeType(selectedContracts[0].payment_terms, selectedContracts[1].payment_terms)
      },
      sla_time: {
        old: selectedContracts[0].sla_time,
        new: selectedContracts[1].sla_time,
        change: getChangeType(selectedContracts[0].sla_time, selectedContracts[1].sla_time, 'lower')
      },
      territory: {
        old: selectedContracts[0].territory,
        new: selectedContracts[1].territory,
        change: getChangeType(selectedContracts[0].territory, selectedContracts[1].territory)
      },
      exclusivity: {
        old: selectedContracts[0].exclusivity ? 'Yes' : 'No',
        new: selectedContracts[1].exclusivity ? 'Yes' : 'No',
        change: selectedContracts[0].exclusivity === selectedContracts[1].exclusivity ? 'neutral' : 'changed'
      },
      warranty_period: {
        old: selectedContracts[0].warranty_period,
        new: selectedContracts[1].warranty_period,
        change: getChangeType(selectedContracts[0].warranty_period, selectedContracts[1].warranty_period, 'higher')
      }
    };
    
    setComparison(changes);
    setLoading(false);
  };
  
  const getChangeType = (old: string | null, newVal: string | null, betterWhen: 'higher' | 'lower' | 'neutral' = 'neutral') => {
    if (old === newVal) return 'neutral';
    if (!old || !newVal) return 'neutral';
    
    const oldNum = parseFloat(old);
    const newNum = parseFloat(newVal);
    
    if (isNaN(oldNum) || isNaN(newNum)) return old !== newVal ? 'changed' : 'neutral';
    
    if (betterWhen === 'higher') {
      return newNum > oldNum ? 'improvement' : 'concern';
    } else if (betterWhen === 'lower') {
      return newNum < oldNum ? 'improvement' : 'concern';
    }
    
    return 'neutral';
  };
  
  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'concern':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getChangeBadge = (change: string) => {
    switch (change) {
      case 'improvement':
        return <Badge className="bg-green-100 text-green-800">Improved</Badge>;
      case 'concern':
        return <Badge className="bg-red-100 text-red-800">Attention</Badge>;
      case 'changed':
        return <Badge className="bg-blue-100 text-blue-800">Changed</Badge>;
      default:
        return <Badge variant="secondary">No Change</Badge>;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contract Comparison</DialogTitle>
        </DialogHeader>
        
        {selectedContracts.length === 2 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Version 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{selectedContracts[0].file_name}</p>
                  <p className="text-xs text-muted-foreground">Version: {selectedContracts[0].version}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Version 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{selectedContracts[1].file_name}</p>
                  <p className="text-xs text-muted-foreground">Version: {selectedContracts[1].version}</p>
                </CardContent>
              </Card>
            </div>
            
            {!comparison ? (
              <div className="text-center py-8">
                <Button onClick={handleCompare} disabled={loading}>
                  {loading ? 'Comparing...' : 'Compare Contracts'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Terms Comparison</h3>
                
                {Object.entries(comparison).map(([key, value]: [string, any]) => (
                  <Card key={key}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </h4>
                        {getChangeBadge(value.change)}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Previous</p>
                          <p className="font-medium">{value.old || 'N/A'}</p>
                        </div>
                        
                        <div className="flex items-center">
                          {getChangeIcon(value.change)}
                          <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Current</p>
                          <p className={cn(
                            "font-medium",
                            value.change === 'improvement' && "text-green-600",
                            value.change === 'concern' && "text-red-600"
                          )}>
                            {value.new || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    This comparison shows the differences between the two selected contract versions. 
                    Pay special attention to items marked with "Attention" as they may require review.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please select exactly 2 contracts to compare.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {selectedContracts.length} contract(s)
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};