import { useState } from "react";
import { Bell, Moon, Shield, Info, ChevronRight, Key, Palette, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, THEME_COLORS, type ThemeColor } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS: { name: string; value: ThemeColor; bgClass: string; textClass: string }[] = [
  { name: "Emerald", value: "emerald", bgClass: "bg-emerald-500", textClass: "text-emerald-500" },
  { name: "Blue", value: "blue", bgClass: "bg-blue-500", textClass: "text-blue-500" },
  { name: "Purple", value: "purple", bgClass: "bg-purple-500", textClass: "text-purple-500" },
  { name: "Orange", value: "orange", bgClass: "bg-orange-500", textClass: "text-orange-500" },
  { name: "Red", value: "red", bgClass: "bg-red-500", textClass: "text-red-500" },
  { name: "Pink", value: "pink", bgClass: "bg-pink-500", textClass: "text-pink-500" },
];

export default function Settings() {
  const { isAdmin, changeAdminPassword } = useAuth();
  const { themeColor, setThemeColor, changeAdminPin } = useTheme();
  const { toast } = useToast();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

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

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "New PIN and confirm PIN must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      });
      return;
    }

    const success = changeAdminPin(currentPin, newPin);
    
    if (success) {
      toast({
        title: "PIN Changed",
        description: "Admin PIN has been updated successfully.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
      setPinDialogOpen(false);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Current PIN is incorrect.",
        variant: "destructive",
      });
    }
  };

  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    toast({
      title: "Theme Updated",
      description: `Theme color changed to ${color}.`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    });
    setColorDialogOpen(false);
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
                onClick={() => setColorDialogOpen(true)}
                className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-secondary/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-600 rounded-lg">
                    <Palette size={18} />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">Theme Color</span>
                    <span className="text-xs text-muted-foreground capitalize">{themeColor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded-full", COLOR_OPTIONS.find(c => c.value === themeColor)?.bgClass)}></div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </button>
              <button 
                onClick={() => setPinDialogOpen(true)}
                className="w-full p-4 flex items-center justify-between border-b border-border hover:bg-secondary/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Lock size={18} />
                  </div>
                  <span className="font-medium">Change Admin PIN</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
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

      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Theme Color</DialogTitle>
            <DialogDescription>Select a color theme for the app</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  themeColor === color.value 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("w-12 h-12 rounded-full shadow-lg", color.bgClass)}></div>
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Admin PIN</DialogTitle>
            <DialogDescription>Enter a 4-digit PIN for quick admin access</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input 
                id="currentPin"
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter current 4-digit PIN" 
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN</Label>
              <Input 
                id="newPin"
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Enter new 4-digit PIN" 
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
              <Input 
                id="confirmPin"
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Confirm new 4-digit PIN" 
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Change PIN
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>Update your admin password</DialogDescription>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Change Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
