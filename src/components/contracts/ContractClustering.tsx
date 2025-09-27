import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smartphone, ChevronRight, Package } from 'lucide-react';
import { useContractStore } from '@/store/contractStore';
import { cn } from '@/lib/utils';

interface ContractClusteringProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractClustering = ({ isOpen, onClose }: ContractClusteringProps) => {
  const { contracts, brands, series } = useContractStore();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  // Group contracts by brand and series
  const getClusteredData = () => {
    const clusters: Record<string, {
      brand: any;
      series: Record<string, {
        seriesInfo: any;
        contracts: any[];
      }>;
    }> = {};
    
    brands.forEach(brand => {
      clusters[brand.id] = {
        brand,
        series: {}
      };
      
      const brandSeries = series.filter(s => s.brand_id === brand.id);
      brandSeries.forEach(s => {
        clusters[brand.id].series[s.id] = {
          seriesInfo: s,
          contracts: contracts.filter(c => c.series_id === s.id)
        };
      });
    });
    
    return clusters;
  };
  
  const clusteredData = getClusteredData();
  
  const getBrandStats = (brandId: string) => {
    const brandContracts = contracts.filter(c => c.brand_id === brandId);
    return {
      total: brandContracts.length,
      active: brandContracts.filter(c => c.status === 'active').length,
      expiring: brandContracts.filter(c => c.status === 'expiring').length,
      avgMargin: brandContracts.length > 0 
        ? (brandContracts.reduce((sum, c) => sum + parseFloat(c.margin || '0'), 0) / brandContracts.length).toFixed(1)
        : '0'
    };
  };
  
  const getSeriesStats = (seriesId: string) => {
    const seriesContracts = contracts.filter(c => c.series_id === seriesId);
    return {
      total: seriesContracts.length,
      active: seriesContracts.filter(c => c.status === 'active').length,
      models: [...new Set(seriesContracts.map(c => c.model))].filter(Boolean)
    };
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Contract Clustering by Brand & Series</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
          {/* Brands List */}
          <div className="border rounded-lg p-4 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold mb-3">Brands</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {Object.entries(clusteredData).map(([brandId, data]) => {
                  const stats = getBrandStats(brandId);
                  return (
                    <Card
                      key={brandId}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedBrand === brandId && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedBrand(brandId)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{data.brand.name}</CardTitle>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary">{stats.total} contracts</Badge>
                          <Badge variant="outline" className="text-green-600">
                            {stats.active} active
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Avg Margin: {stats.avgMargin}%
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {/* Series & Contracts */}
          {selectedBrand ? (
            <div className="col-span-2 border rounded-lg p-4 overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold mb-3">
                {clusteredData[selectedBrand].brand.name} Series
              </h3>
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {Object.entries(clusteredData[selectedBrand].series).map(([seriesId, seriesData]) => {
                    const stats = getSeriesStats(seriesId);
                    
                    if (seriesData.contracts.length === 0) return null;
                    
                    return (
                      <Card key={seriesId}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-primary" />
                              <CardTitle className="text-sm">{seriesData.seriesInfo.name}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>{stats.total} contracts</Badge>
                              <Badge variant="outline" className="text-green-600">
                                {stats.active} active
                              </Badge>
                            </div>
                          </div>
                          {seriesData.seriesInfo.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {seriesData.seriesInfo.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {stats.models.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">Models:</span>
                                {stats.models.map(model => (
                                  <Badge key={model} variant="secondary" className="text-xs">
                                    {model}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-2 h-8">
                                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                                <TabsTrigger value="contracts" className="text-xs">Contracts</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="mt-2">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Avg Margin</p>
                                    <p className="font-medium">
                                      {seriesData.contracts.length > 0
                                        ? `${(seriesData.contracts.reduce((sum, c) => sum + parseFloat(c.margin || '0'), 0) / seriesData.contracts.length).toFixed(1)}%`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Avg Payment Terms</p>
                                    <p className="font-medium">
                                      {seriesData.contracts[0]?.payment_terms || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Territory</p>
                                    <p className="font-medium">
                                      {seriesData.contracts[0]?.territory || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Risk Level</p>
                                    <Badge 
                                      variant={
                                        seriesData.contracts[0]?.risk_level === 'low' ? 'default' :
                                        seriesData.contracts[0]?.risk_level === 'high' ? 'destructive' : 'secondary'
                                      }
                                      className="mt-1"
                                    >
                                      {seriesData.contracts[0]?.risk_level || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="contracts" className="mt-2">
                                <ScrollArea className="h-32">
                                  <div className="space-y-1">
                                    {seriesData.contracts.map(contract => (
                                      <div key={contract.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                                        <div className="flex items-center gap-2">
                                          <Package className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs font-medium">{contract.file_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Badge 
                                            variant={
                                              contract.status === 'active' ? 'default' :
                                              contract.status === 'expiring' ? 'secondary' : 'destructive'
                                            }
                                            className="text-xs h-5"
                                          >
                                            {contract.status}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            v{contract.version}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="col-span-2 border rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a brand to view its series and contracts</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};