import { Link, useLocation } from "wouter";
import { Home, BarChart2, GraduationCap, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: BarChart2, label: "Summary", href: "/reports" },
    { icon: GraduationCap, label: "Classes", href: "/classes" },
    { icon: Users, label: "Students", href: "/students" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-border/40">
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-border/10 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 max-w-md mx-auto rounded-t-2xl">
        <div className="flex justify-around items-center h-20 px-4 pb-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (location !== "/" && item.href !== "/" && location.startsWith(item.href)) || (item.href === "/reports" && location === "/summary");
            return (
              <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center w-full h-full space-y-1">
                  <div className={cn(
                    "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-y-[-5px]" 
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}>
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-300", 
                    isActive ? "text-emerald-600 font-bold" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
