import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Users, ChevronRight, Plus, Trash2, Loader2 } from "lucide-react";
import { api, type ClassGroup } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Classes() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses();
      setClasses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load classes. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;

    try {
      const id = newClassName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      await api.createClass(id, newClassName);
      setAddDialogOpen(false);
      setNewClassName("");
      toast({
        title: "Class Added",
        description: "New class has been created successfully.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
      fetchClasses();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    try {
      await api.deleteClass(classId);
      toast({
        title: "Class Deleted",
        description: `${className} has been removed.`,
        variant: "destructive",
      });
      fetchClasses();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 pb-24">
      <header className="pt-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading">Classes</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Admin overview of all class groups" : "Select a class to view details"}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <Plus size={20} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddClass} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class Name</Label>
                  <Input 
                    id="className" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. S4-A" 
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-emerald-700">Add Class</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Classes</h3>
            <p className="text-2xl font-bold text-slate-900">{classes.length}</p>
          </div>
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Students</h3>
            <p className="text-2xl font-bold text-slate-900">
              {classes.reduce((acc, curr) => acc + curr.students, 0)}
            </p>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No classes found.</p>
          {isAdmin && <p className="text-sm mt-2">Add a class using the + button above.</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {classes.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <Link href={`/attendance/Fajr/${cls.id}`} className="flex items-center space-x-4 flex-1">
                <div className={`p-3 rounded-xl ${isAdmin ? 'bg-slate-100 text-slate-700' : 'bg-primary/10 text-primary'}`}>
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">{cls.students} Students</p>
                </div>
              </Link>
              
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
