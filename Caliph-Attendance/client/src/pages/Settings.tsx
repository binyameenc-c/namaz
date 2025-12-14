import { useState } from "react";
import { Bell, Moon, Shield, Info, ChevronRight, Key } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { isAdmin, changeAdminPassword } = useAuth();
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "Password too short",
        description: "Password must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }

    const success = changeAdminPassword(currentPassword, newPassword);
    
    if (success) {
      toast({
        title: "Password Changed",
        description: "Admin password has been updated successfully.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Incorrect Password",
        description: "Current password is incorrect.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background space-y-8">
      <header className="pt-6">
        <h1 className="text-3xl font-bold font-heading">Settings</h1>
        <p className="text-sm text-muted-foreground">Preferences and configuration</p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">General</h3>
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border hover:bg-secondary/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Bell size={18} />
                </div>
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Moon size={18} />
                </div>
                <span className="font-medium">Dark Mode</span>
              </div>
              <div className="w-10 h-6 bg-secondary rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">System</h3>
          <div className="bg-card border border-border rounded-3xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border hover:bg-secondary/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Shield size={18} />
                </div>
                <span className="font-medium">Privacy & Security</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-secondary/30 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <Info size={18} />
                </div>
                <span className="font-medium">About Caliph</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">Admin</h3>
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <button 
                onClick={() => setPasswordDialogOpen(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <Key size={18} />
                  </div>
                  <span className="font-medium">Change Admin Password</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>
          </section>
        )}
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword"
                type="password" 
                placeholder="Enter current password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword"
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-emerald-700">
              Change Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
