import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Check, X, Search, Save, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { saveClassAttendance } from "@/lib/attendanceStore";
import { useAuth } from "@/lib/auth";

interface Student {
  id: string;
  name: string;
  rollNo: number;
  classId: string;
  gender: 'M' | 'F';
}

interface ClassData {
  id: string;
  name: string;
  studentCount: number;
}

export default function Attendance() {
  const [match, params] = useRoute("/attendance/:type/:classId");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const type = params?.type || "Fajr";
  const classId = params?.classId || "";
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [absentReasons, setAbsentReasons] = useState<Record<string, string>>({});
  const [quickAbsent, setQuickAbsent] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  
  const attendanceRef = useRef(attendance);
  const absentReasonsRef = useRef(absentReasons);
  const hasSavedRef = useRef(hasSaved);
  
  useEffect(() => {
    attendanceRef.current = attendance;
    absentReasonsRef.current = absentReasons;
    hasSavedRef.current = hasSaved;
  }, [attendance, absentReasons, hasSaved]);

  useEffect(() => {
    async function fetchData() {
      if (!classId) return;
      setLoading(true);
      try {
        const [classesRes, studentsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch(`/api/students/class/${classId}`)
        ]);
        
        if (classesRes.ok) {
          const classes = await classesRes.json();
          const cls = classes.find((c: ClassData) => c.id === classId);
          setClassData(cls || null);
        }
        
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
          const initial: Record<string, 'present' | 'absent'> = {};
          studentsData.forEach((s: Student) => initial[s.id] = 'present');
          setAttendance(initial);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    setHasSaved(false);
  }, [classId]);
  
  const autoSaveAttendance = useCallback(() => {
    if (hasSavedRef.current || !classData || Object.keys(attendanceRef.current).length === 0) return;
    saveClassAttendance(type, classId, classData.name, attendanceRef.current, students, absentReasonsRef.current);
  }, [type, classId, classData, students]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      autoSaveAttendance();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        autoSaveAttendance();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      autoSaveAttendance();
    };
  }, [autoSaveAttendance]);

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

  const updateReason = (studentId: string, reason: string) => {
    setAbsentReasons(prev => ({
      ...prev,
      [studentId]: reason
    }));
  };

  const submitAttendance = () => {
    if (classData) {
      saveClassAttendance(type, classId, classData.name, attendance, students, absentReasons);
    }
    setHasSaved(true);
    toast({
      title: "Attendance Saved",
      description: `Marked for ${classData?.name} - ${type}`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900"
    });
    setLocation(`/select-class/${type}`);
  };

  const clearAttendance = () => {
    const cleared: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => cleared[s.id] = 'present');
    setAttendance(cleared);
    setAbsentReasons({});
    setQuickAbsent("");
    toast({
      title: "Attendance Cleared",
      description: "All students marked as present.",
      className: "bg-blue-50 border-blue-200 text-blue-900"
    });
  };

  const markAllAbsent = () => {
    const allAbsent: Record<string, 'present' | 'absent'> = {};
    students.forEach(s => allAbsent[s.id] = 'absent');
    setAttendance(allAbsent);
    toast({
      title: "All Marked Absent",
      description: "All students marked as absent.",
      variant: "destructive"
    });
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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={clearAttendance}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 active:scale-95 transition-all"
                  title="Clear (Mark All Present)"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={markAllAbsent}
                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all"
                  title="Mark All Absent"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="text-right">
               <div className="text-xs font-medium text-muted-foreground">Present</div>
               <div className="text-lg font-bold text-emerald-600">{presentCount}/{students.length}</div>
            </div>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No students in this class</p>
            <p className="text-sm">Add students from the admin panel</p>
          </div>
        ) : (
          students.map((student) => {
            const isPresent = attendance[student.id] === 'present';
            return (
              <motion.div 
                key={student.id} 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-200",
                  isPresent 
                    ? "bg-card border-border" 
                    : "bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50"
                )}
              >
                <div className="flex items-center justify-between">
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
                </div>
                
                {!isPresent && (
                  <div className="mt-2 ml-14">
                    <input
                      type="text"
                      placeholder="Reason (optional): sick, leave, etc."
                      value={absentReasons[student.id] || ""}
                      onChange={(e) => updateReason(student.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-lg focus:outline-none focus:border-red-400"
                    />
                  </div>
                )}
              </motion.div>
            );
          })
        )}
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
