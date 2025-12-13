import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Users, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { getClasses, addClass, updateClass, deleteClass, type ClassGroup } from "@/lib/mockData";
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<{id: string, name: string, students: number} | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassStudents, setNewClassStudents] = useState("");

  useEffect(() => {
    setClasses(getClasses());
  }, []);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName && newClassStudents) {
      addClass(newClassName, parseInt(newClassStudents) || 0);
      setClasses(getClasses());
    }
    setAddDialogOpen(false);
    setNewClassName("");
    setNewClassStudents("");
    toast({
      title: "Class Added",
      description: "New class has been created successfully.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    });
  };

  const handleEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      const form = e.target as HTMLFormElement;
      const nameInput = form.querySelector('#editClassName') as HTMLInputElement;
      const studentsInput = form.querySelector('#editClassStudents') as HTMLInputElement;
      updateClass(editingClass.id, nameInput.value, parseInt(studentsInput.value) || 0);
      setClasses(getClasses());
    }
    setEditDialogOpen(false);
    setEditingClass(null);
    toast({
      title: "Class Updated",
      description: "Class details have been updated.",
      className: "bg-blue-50 border-blue-200 text-blue-900",
    });
  };

  const handleDeleteClass = (classId: string, className: string) => {
    deleteClass(classId);
    setClasses(getClasses());
    toast({
      title: "Class Deleted",
      description: `${className} has been removed.`,
      variant: "destructive",
    });
  };

  const openEditDialog = (cls: {id: string, name: string, students: number}) => {
    setEditingClass(cls);
    setEditDialogOpen(true);
  };

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
                <div className="space-y-2">
                  <Label htmlFor="classStudents">Number of Students</Label>
                  <Input 
                    id="classStudents" 
                    type="number"
                    value={newClassStudents}
                    onChange={(e) => setNewClassStudents(e.target.value)}
                    placeholder="e.g. 30" 
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
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Capacity</h3>
            <p className="text-2xl font-bold text-slate-900">
              {classes.reduce((acc, curr) => acc + curr.students, 0)}
            </p>
          </div>
        </div>
      )}

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
                  onClick={() => openEditDialog(cls)}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Edit2 size={16} />
                </button>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditClass} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editClassName">Class Name</Label>
              <Input 
                id="editClassName" 
                defaultValue={editingClass?.name}
                placeholder="e.g. S4-A" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editClassStudents">Number of Students</Label>
              <Input 
                id="editClassStudents" 
                type="number"
                defaultValue={editingClass?.students}
                placeholder="e.g. 30" 
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Update Class</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
