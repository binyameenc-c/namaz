import { STUDENTS } from "@/lib/mockData";
import { Search, Plus, Trash2, Edit2, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Students() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  // In a real app, this would be from API, here we just filter the static list
  // For the purpose of "Adding/Deleting" in mock mode, we'll just show the UI interactions
  const allStudents = Object.values(STUDENTS).flat();

  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    toast({
      title: "Student Removed",
      description: `${name} has been removed from the database.`,
      variant: "destructive",
    });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Added",
      description: "New student has been successfully registered.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    });
  };

  return (
    <div className="p-6 min-h-screen bg-background space-y-6 pb-24">
       <header className="pt-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading">Students</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Manage student records" : "Directory of all registered students"}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <UserPlus size={20} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="e.g. Abdullah Khan" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roll">Roll No</Label>
                    <Input id="roll" type="number" placeholder="e.g. 45" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s1a">S1-A</SelectItem>
                        <SelectItem value="s1b">S1-B</SelectItem>
                        <SelectItem value="s2a">S2-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-emerald-700">Add Student</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search students..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="space-y-2">
        {filteredStudents.map((student) => (
          <div key={student.id} className="flex items-center space-x-4 p-3 bg-card border border-border rounded-2xl hover:bg-secondary/30 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
              {student.rollNo}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{student.name}</h4>
              <p className="text-xs text-muted-foreground">Class {student.classId} • ID: {student.id}</p>
            </div>
            
            {isAdmin && (
              <div className="flex space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(student.id, student.name)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
