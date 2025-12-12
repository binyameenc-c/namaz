import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Check, X, Search, Save } from "lucide-react";
import { STUDENTS, CLASSES } from "@/lib/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { saveClassAttendance } from "@/lib/attendanceStore";

export default function Attendance() {
  const [match, params] = useRoute("/attendance/:type/:classId");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const type = params?.type || "Fajr";
  const classId = params?.classId || "S1A";
  
  const classData = CLASSES.find(c => c.id === classId);
  const students = STUDENTS[classId] || [];

  // State: Record<studentId, 'present' | 'absent'>
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [quickAbsent, setQuickAbsent] = useState("");

  // Initialize all as present by default on mount
  useEffect(() => {
    const initial: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => initial[s.id] = 'present');
    setAttendance(initial);
  }, [classId]);

  const handleQuickAbsent = (value: string) => {
    setQuickAbsent(value);
    
    // Reset all to present first
    const newAttendance: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => newAttendance[s.id] = 'present');

    if (!value.trim()) {
      setAttendance(newAttendance);
      return;
    }

    // Parse CSV
    const rollNos = value.split(',').map(s => s.trim()).filter(s => s !== "").map(Number);
    
    students.forEach(s => {
      if (rollNos.includes(s.rollNo)) {
        newAttendance[s.id] = 'absent';
      }
    });

    setAttendance(newAttendance);
  };

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const submitAttendance = () => {
    if (classData) {
      saveClassAttendance(type, classId, classData.name, attendance, students);
    }
    toast({
      title: "Attendance Saved",
      description: `Marked for ${classData?.name} - ${type}`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900"
    });
    setLocation(`/select-class/${type}`);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <div className="min-h-screen bg-background pb-28 relative">
       {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-6 py-4 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => history.back()} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold font-heading leading-none">{classData?.name}</h1>
              <p className="text-xs text-muted-foreground mt-1">{type} Attendance</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-xs font-medium text-muted-foreground">Present</div>
             <div className="text-lg font-bold text-emerald-600">{presentCount}/{students.length}</div>
          </div>
        </div>

        {/* Quick Absent Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Quick Absent (e.g. 1, 5, 12)" 
            value={quickAbsent}
            onChange={(e) => handleQuickAbsent(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-transparent focus:bg-background focus:border-primary rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Student List */}
      <div className="p-4 space-y-2">
        {students.map((student) => {
          const isPresent = attendance[student.id] === 'present';
          return (
            <motion.div 
              key={student.id} 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border transition-all duration-200",
                isPresent 
                  ? "bg-card border-border" 
                  : "bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                  isPresent ? "bg-secondary text-foreground" : "bg-red-100 text-red-700"
                )}>
                  {student.rollNo}
                </div>
                <div>
                  <h4 className={cn("font-medium", !isPresent && "text-red-700")}>{student.name}</h4>
                  <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                </div>
              </div>

              <button 
                onClick={() => toggleStatus(student.id)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90",
                  isPresent 
                    ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                )}
              >
                {isPresent ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
        <button 
          onClick={submitAttendance}
          className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Save size={20} />
          <span>Save Attendance</span>
        </button>
      </div>
    </div>
  );
}
