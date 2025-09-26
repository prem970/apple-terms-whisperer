import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Contract, ChatMessage } from "@/types";
import { useContractStore } from "@/store/contractStore";

interface ChatModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ contract, isOpen, onClose }: ChatModalProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chatMessages, addChatMessage } = useContractStore();
  
  const contractMessages = chatMessages.filter(msg => msg.contractId === contract?.id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [contractMessages]);

  const handleSend = async () => {
    if (!input.trim() || !contract) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date(),
      contractId: contract.id,
    };

    addChatMessage(userMessage);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, contract);
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        contractId: contract.id,
        highlightedClause: aiResponse.clause,
      };
      addChatMessage(aiMessage);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, contract: Contract) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('margin') || lowerQuery.includes('commission')) {
      return {
        content: `Based on the ${contract.series} agreement, your current commission margin is **${contract.keyTerms?.margin || '10%'}**. This represents ${contract.changes?.find(c => c.field === 'Margin') ? 'an improvement from the previous version' : 'the standard rate'}.`,
        clause: `Section 4.2: Commission Structure - Distributor shall receive ${contract.keyTerms?.margin || '10%'} margin on all units sold.`
      };
    }
    
    if (lowerQuery.includes('sla') || lowerQuery.includes('service')) {
      return {
        content: `The service level agreement for ${contract.series} specifies a **${contract.keyTerms?.slaTime || '24 hour'}** turnaround time for repairs and replacements. This is ${contract.keyTerms?.slaTime === '12 hours' ? 'faster than' : 'standard compared to'} previous models.`,
        clause: `Section 7.1: Service Requirements - All warranty claims must be processed within ${contract.keyTerms?.slaTime || '24 hours'}.`
      };
    }
    
    if (lowerQuery.includes('territory') || lowerQuery.includes('rights')) {
      return {
        content: `Your distribution rights for ${contract.series} cover **${contract.keyTerms?.territory || '1 state'}**. ${contract.keyTerms?.exclusivity ? 'You have exclusive rights in this territory.' : 'This is a non-exclusive arrangement.'}`,
        clause: `Section 3.1: Territory Rights - Distributor is authorized to sell in ${contract.keyTerms?.territory || 'designated territory'}.`
      };
    }
    
    if (lowerQuery.includes('payment') || lowerQuery.includes('terms')) {
      return {
        content: `Payment terms for ${contract.series} are **${contract.keyTerms?.paymentTerms || '60 days'}** net. Invoices are generated monthly and payment is expected within the specified timeframe.`,
        clause: `Section 5.3: Payment Terms - All invoices are due ${contract.keyTerms?.paymentTerms || '60 days'} from date of issue.`
      };
    }
    
    if (lowerQuery.includes('expire') || lowerQuery.includes('renewal')) {
      const daysUntilExpiry = Math.floor((contract.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        content: `This ${contract.series} agreement expires in **${daysUntilExpiry} days**. ${daysUntilExpiry < 60 ? '⚠️ Renewal action is recommended soon.' : 'You have time to plan for renewal negotiations.'}`,
        clause: `Section 12.1: Term and Renewal - This agreement expires on ${contract.expiryDate.toLocaleDateString()}.`
      };
    }
    
    return {
      content: `I can help you understand the ${contract.series} agreement. You can ask about margins, service levels, territory rights, payment terms, or any other contract details. What would you like to know?`,
      clause: undefined
    };
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-foreground/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-primary-foreground">AI Contract Assistant</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground">
                    {contract.brand} {contract.series}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground">
                    {contract.documentType}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {contractMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Ask me anything about this contract</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  I can help you understand margins, service levels, payment terms, territory rights, and identify any risks or important changes.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {["What's my margin?", "Service requirements?", "Payment terms?", "Territory rights?"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {contractMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-start gap-2 mb-1">
                      {message.sender === 'ai' && (
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.sender === 'user' && (
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    {message.highlightedClause && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="ml-8 mt-2 p-3 rounded-lg bg-accent/10 border border-accent/20"
                      >
                        <p className="text-xs font-mono text-accent">{message.highlightedClause}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <motion.div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-2 h-2 bg-primary rounded-full"
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about margins, SLA, payment terms..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping} className="bg-gradient-primary">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}