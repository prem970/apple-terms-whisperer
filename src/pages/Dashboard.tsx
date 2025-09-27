import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, FileText, AlertTriangle, Clock, Search, GitCompare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Navbar } from "@/components/layout/Navbar";
import { ContractCard } from "@/components/contracts/ContractCard";
import { ChatModal } from "@/components/contracts/ChatModal";
import { UploadModal } from "@/components/contracts/UploadModal";
import { ContractDetailsModal } from "@/components/contracts/ContractDetailsModal";
import { ContractComparison } from "@/components/contracts/ContractComparison";
import { ContractClustering } from "@/components/contracts/ContractClustering";
import { useContractStore } from "@/store/contractStore";
import { useAuthStore } from "@/store/authStore";
import { Contract } from "@/types";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { 
    contracts, 
    alerts, 
    brands,
    series,
    selectedContracts,
    toggleContractSelection,
    markAlertAsRead,
    fetchContracts,
    fetchAlerts,
    fetchBrands,
    fetchSeries 
  } = useContractStore();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [chatContract, setChatContract] = useState<Contract | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [clusteringModalOpen, setClusteringModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchContracts();
    fetchAlerts();
    fetchBrands();
    fetchSeries();
  }, []);

  // Filter contracts based on search query
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchQuery === '' || 
      contract.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.version.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Stats calculation
  const stats = {
    total: filteredContracts.length,
    active: filteredContracts.filter(c => c.status === 'active').length,
    expiring: filteredContracts.filter(c => c.status === 'expiring').length,
    expired: filteredContracts.filter(c => c.status === 'expired').length,
  };

  const handleContractSelect = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && activeTab === 'alerts') {
      setActiveTab('all');
    }
  };

  const handleChat = (contract: Contract) => {
    setChatContract(contract);
  };

  useEffect(() => {
    // Check for hash navigation to alerts
    if (window.location.hash === '#alerts') {
      setActiveTab('alerts');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Contract Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
          <Button 
            onClick={() => setIsUploadOpen(true)}
            className="bg-gradient-primary shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Contract
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats.total}</span>
                  <FileText className="h-5 w-5 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-card border-success/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-success">{stats.active}</span>
                  <TrendingUp className="h-5 w-5 text-success/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-card border-warning/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expiring Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-warning">{stats.expiring}</span>
                  <Clock className="h-5 w-5 text-warning/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-card border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expired
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-destructive">{stats.expired}</span>
                  <AlertTriangle className="h-5 w-5 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-grid">
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expiring">Expiring</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {alerts.filter(a => !a.is_read).length > 0 && (
                <Badge className="ml-2 h-4 px-1 text-xs" variant="destructive">
                  {alerts.filter(a => !a.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredContracts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContracts.map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ContractCard
                      contract={contract}
                      onSelect={handleContractSelect}
                      onChat={handleChat}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No contracts found' : 'No contracts available'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? `No contracts match your search "${searchQuery}"`
                    : 'Upload your first contract to get started'
                  }
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts
                .filter(c => c.status === 'active')
                .map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ContractCard
                      contract={contract}
                      onSelect={handleContractSelect}
                      onChat={handleChat}
                    />
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="expiring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContracts
                .filter(c => c.status === 'expiring')
                .map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ContractCard
                      contract={contract}
                      onSelect={handleContractSelect}
                      onChat={handleChat}
                    />
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          alert.is_read ? 'bg-muted/30' : 'bg-card'
                        } hover:shadow-md transition-all cursor-pointer`}
                        onClick={() => markAlertAsRead(alert.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  alert.severity === 'high' ? 'destructive' :
                                  alert.severity === 'medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {alert.type}
                              </Badge>
                              {!alert.is_read && (
                                <Badge className="text-xs bg-primary">New</Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(alert.created_at), 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ChatModal
        contract={chatContract}
        isOpen={!!chatContract}
        onClose={() => setChatContract(null)}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
      <ContractDetailsModal
        contract={selectedContract}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedContract(null);
        }}
      />
      <ContractComparison
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
      />
      <ContractClustering
        isOpen={clusteringModalOpen}
        onClose={() => setClusteringModalOpen(false)}
      />
    </div>
  );
}