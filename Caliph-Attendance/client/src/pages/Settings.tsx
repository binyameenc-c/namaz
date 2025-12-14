import { Bell, Moon, Shield, Info, ChevronRight } from "lucide-react";

export default function Settings() {
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
      </div>
    </div>
  );
}
