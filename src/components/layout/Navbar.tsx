import { Bell, LogOut, Search, User, Calendar, Building, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/store/authStore";
import { useContractStore } from "@/store/contractStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { alerts, contracts, markAlertAsRead } = useContractStore();
  const [searchQuery, setSearchQuery] = useState("");
  const unreadAlerts = alerts.filter(a => !a.is_read).length;
  const expiringContracts = contracts.filter(c => c.status === 'expiring');

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Contract Assistant
          </h1>
          
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contracts, brands, or series..."
                className="pl-10 bg-muted/30 border-input/50"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive">
                    {unreadAlerts}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Notifications</span>
                  <Badge variant="outline" className="text-xs">
                    {unreadAlerts} unread
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem
                      key={alert.id}
                      className="flex flex-col items-start p-3 cursor-pointer"
                      onClick={() => {
                        markAlertAsRead(alert.id);
                        navigate("/dashboard#alerts");
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-destructive' :
                          alert.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                        <span className="font-medium text-sm flex-1">{alert.title}</span>
                        {!alert.is_read && (
                          <Badge className="text-xs bg-primary">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </ScrollArea>
              {alerts.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center justify-center text-primary cursor-pointer"
                    onClick={() => navigate("/dashboard#alerts")}
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
              {expiringContracts.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-warning">
                    {expiringContracts.length} contracts expiring soon
                  </DropdownMenuLabel>
                  {expiringContracts.slice(0, 3).map((contract) => (
                    <DropdownMenuItem
                      key={contract.id}
                      className="flex items-center gap-2 p-2"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Calendar className="h-3 w-3 text-warning" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{contract.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(contract.expiry_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="w-fit mt-2 text-xs">
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Details</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground ml-6">
                  <p>Department: {user?.department || 'Operations'}</p>
                  <p>Location: {user?.location || 'Head Office'}</p>
                  <p>Employee ID: {user?.id || 'EMP001'}</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}