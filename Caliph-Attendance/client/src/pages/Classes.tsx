import { Link } from "wouter";
import { ArrowLeft, Users, ChevronRight, BarChart, Settings2 } from "lucide-react";
import { CLASSES } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";

export default function Classes() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 pb-24">
      <header className="pt-6">
        <h1 className="text-3xl font-bold font-heading">Classes</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Admin overview of all class groups" : "Select a class to view details"}
        </p>
      </header>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Classes</h3>
            <p className="text-2xl font-bold text-slate-900">{CLASSES.length}</p>
          </div>
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Capacity</h3>
            <p className="text-2xl font-bold text-slate-900">
              {CLASSES.reduce((acc, curr) => acc + curr.students, 0)}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {CLASSES.map((cls) => (
          <Link key={cls.id} href={`/attendance/Fajr/${cls.id}`}>
            <a className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:bg-secondary/50 group">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${isAdmin ? 'bg-slate-100 text-slate-700' : 'bg-primary/10 text-primary'}`}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">{cls.students} Students</p>
                </div>
              </div>
              
              {isAdmin ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md">Edit</span>
                  <Settings2 size={18} />
                </div>
              ) : (
                <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
              )}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
