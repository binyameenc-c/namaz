import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
  teacher: Teacher | null;
  login: (teacher: Teacher) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TEACHER_STORAGE_KEY = "caliph_teacher";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem(TEACHER_STORAGE_KEY);
    if (stored) {
      try {
        setTeacher(JSON.parse(stored));
      } catch {
        localStorage.removeItem(TEACHER_STORAGE_KEY);
      }
    }
  }, []);

  const login = (teacherData: Teacher) => {
    setTeacher(teacherData);
    localStorage.setItem(TEACHER_STORAGE_KEY, JSON.stringify(teacherData));
  };

  const logout = () => {
    setTeacher(null);
    setIsAdmin(false);
    localStorage.removeItem(TEACHER_STORAGE_KEY);
  };

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
    <AuthContext.Provider value={{ 
      isAdmin, 
      toggleAdmin, 
      teacher, 
      login, 
      logout, 
      isAuthenticated: !!teacher 
    }}>
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
