import { api, type Student, type ClassGroup } from "@/lib/api";
import { Search, Trash2, Edit2, UserPlus, FileSpreadsheet, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";

export default function Students() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);
  const [excelClass, setExcelClass] = useState("");
  const [excelPreview, setExcelPreview] = useState<{rollNo: number; name: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [newStudentGender, setNewStudentGender] = useState<'M' | 'F'>('M');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        api.getStudents(),
        api.getClasses()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const studentsList: {rollNo: number; name: string}[] = [];
        jsonData.forEach((row, index) => {
          if (index === 0) return;
          const rollNo = row[0];
          const name = row[1];
          if (rollNo && name) {
            studentsList.push({ rollNo: Number(rollNo), name: String(name).trim() });
          }
        });
        
        setExcelPreview(studentsList);
        if (studentsList.length === 0) {
          toast({
            title: "No students found",
            description: "The Excel file should have Roll No in column A and Name in column B.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error reading file",
          description: "Could not read the Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelImport = async () => {
    if (!excelClass) {
      toast({
        title: "Error",
        description: "Please select a class first.",
        variant: "destructive",
      });
      return;
    }
    
    if (excelPreview.length === 0) {
      toast({
        title: "Error",
        description: "No students to import. Please upload a valid Excel file.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await api.createStudentsBulk(
        excelPreview.map(s => ({ name: s.name, rollNo: s.rollNo })),
        excelClass
      );
      
      setExcelDialogOpen(false);
      setExcelPreview([]);
      setExcelClass("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      toast({
        title: "Excel Import Successful",
        description: `${excelPreview.length} students have been added to ${classes.find(c => c.id === excelClass)?.name || excelClass}.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import students",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.deleteStudent(id);
      toast({
        title: "Student Removed",
        description: `${name} has been removed from the database.`,
        variant: "destructive",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudentName || !newStudentClass) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await api.createStudent({
        name: newStudentName,
        classId: newStudentClass,
        gender: newStudentGender
      });
      
      setAddDialogOpen(false);
      setNewStudentName("");
      setNewStudentClass("");
      setNewStudentGender('M');
      
      toast({
        title: "Student Added",
        description: "New student has been successfully registered.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add student",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <div className="flex gap-2">
            <Dialog open={excelDialogOpen} onOpenChange={setExcelDialogOpen}>
              <DialogTrigger asChild>
                <button className="bg-green-600 text-white p-3 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-transform" title="Import from Excel">
                  <FileSpreadsheet size={20} />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import from Excel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="excelClass">Select Class</Label>
                    <Select value={excelClass} onValueChange={setExcelClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excelFile">Upload Excel File</Label>
                    <Input 
                      id="excelFile"
                      ref={fileInputRef}
                      type="file" 
                      accept=".xlsx,.xls"
                      onChange={handleExcelFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Format: Column A = Roll No, Column B = Name (first row is header)</p>
                  </div>
                  
                  {excelPreview.length > 0 && (
                    <div className="space-y-2">
                      <Label>Preview ({excelPreview.length} students)</Label>
                      <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2 space-y-1">
                        {excelPreview.map((student, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                            <span className="w-8 text-muted-foreground">{student.rollNo}</span>
                            <span>{student.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleExcelImport} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={excelPreview.length === 0}
                  >
                    Import {excelPreview.length} Students
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
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
                    <Input 
                      id="name" 
                      placeholder="e.g. Abdullah Khan" 
                      required 
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={newStudentGender} onValueChange={(v) => setNewStudentGender(v as 'M' | 'F')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select value={newStudentClass} onValueChange={setNewStudentClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-emerald-700">Add Student</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No students found.</p>
          {isAdmin && <p className="text-sm mt-2">Add students using the + button above.</p>}
        </div>
      ) : (
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
      )}
    </div>
  );
}
