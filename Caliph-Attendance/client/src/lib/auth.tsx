import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      toast({
        title: "Admin Mode Deactivated",
        description: "Returned to standard user view.",
      });
    } else {
      setShowPasswordDialog(true);
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "123456") {
      setIsAdmin(true);
      setShowPasswordDialog(false);
      setPassword("");
      toast({
        title: "Admin Mode Activated",
        description: "You now have full edit access.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password provided.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, toggleAdmin }}>
      {children}
      
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={verifyPassword} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
            <Button type="submit" className="w-full">
              Unlock Access
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
