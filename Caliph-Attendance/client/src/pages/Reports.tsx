import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Download, Trash2, X, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDailySummary, generateFullDailyReport, getClassSummariesByPrayer, getAttendanceStore, clearAllAttendance, clearPrayerAttendance, type DailySummary, type ClassSummaryByPrayer } from "@/lib/attendanceStore";
import { jsPDF } from "jspdf";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLocation } from "wouter";

const TABS = ['Daily', 'Weekly', 'Monthly'];
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Daily');
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [classSummaries, setClassSummaries] = useState<ClassSummaryByPrayer[]>([]);
  const [clearPrayerDialogOpen, setClearPrayerDialogOpen] = useState(false);

  const refreshData = () => {
    setSummary(getDailySummary());
    setClassSummaries(getClassSummariesByPrayer());
  };

  useEffect(() => {
    refreshData();
    
    // Listen for storage changes (attendance data updates)
    const handleStorageChange = () => {
      refreshData();
    };
    
    // Listen for visibility changes - refresh when page comes into focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleDownload = () => {
    const store = getAttendanceStore();
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    doc.setFontSize(20);
    doc.text("Daily Attendance Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(today, 20, 30);
    
    let yPos = 50;
    
    type AbsentStudent = { name: string; rollNo: number; reason?: string };
    const classReport: Record<string, { className: string; absentStudents: AbsentStudent[] }> = {};
    
    prayers.forEach((prayer) => {
      const prayerStore = store[prayer] || {};
      Object.keys(prayerStore).forEach((classId) => {
        const classData = prayerStore[classId];
        if (!classReport[classId]) {
          classReport[classId] = { className: classData.className, absentStudents: [] };
        }
        classData.absentStudents.forEach((s: AbsentStudent) => {
          classReport[classId].absentStudents.push(s);
        });
      });
    });
    
    Object.values(classReport).forEach((cls) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(cls.className, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      if (cls.absentStudents.length === 0) {
        doc.text("All present", 25, yPos);
        yPos += 6;
      } else {
        cls.absentStudents.forEach((s) => {
          const reasonText = s.reason ? ` (${s.reason})` : "";
          doc.text(`${s.name}${reasonText}`, 25, yPos);
          yPos += 6;
          
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
      yPos += 8;
    });
    
    doc.save(`Attendance_Report_${today.replace(/\s/g, "_")}.pdf`);
    
    toast({
      title: "Download Complete",
      description: `Attendance_Report_${today.replace(/\s/g, "_")}.pdf saved.`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    });
  };

  const handleShare = () => {
    const message = generateFullDailyReport();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear ALL attendance data? This cannot be undone.")) {
      clearAllAttendance();
      refreshData();
      toast({
        title: "Attendance Cleared",
        description: "All attendance data has been cleared.",
        variant: "destructive",
      });
    }
  };

  const handleClearPrayer = (prayer: string) => {
    if (confirm(`Are you sure you want to clear ${prayer} attendance?`)) {
      clearPrayerAttendance(prayer);
      refreshData();
      toast({
        title: `${prayer} Cleared`,
        description: `${prayer} attendance data has been cleared.`,
        variant: "destructive",
      });
    }
  };

  const handleEditAttendance = (prayer: string, classId: string) => {
    setLocation(`/attendance/${prayer}/${classId}`);
  };

  const hasData = summary && summary.totalStudents > 0;

  return (
    <div className="p-6 space-y-8 min-h-screen bg-background pb-24">
      <header className="pt-6">
        <h1 className="text-3xl font-bold font-heading">Summary</h1>
        <p className="text-sm text-muted-foreground">Attendance analytics & insights</p>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-secondary rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === tab 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 p-4 bg-card border border-border rounded-2xl shadow-sm active:scale-95 transition-transform hover:bg-secondary/50"
        >
          <div className="p-2 bg-slate-100 text-slate-600 rounded-full">
            <Download size={18} />
          </div>
          <span className="font-semibold text-sm">Download</span>
        </button>

        <button 
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm active:scale-95 transition-transform hover:bg-emerald-100"
        >
          <div className="p-2 bg-emerald-500 text-white rounded-full">
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-[18px] h-[18px]"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-emerald-800">Share</span>
        </button>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Admin Controls</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setClearPrayerDialogOpen(true)}
              className="flex items-center justify-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-amber-100"
            >
              <Trash2 size={16} className="text-amber-600" />
              <span className="font-medium text-sm text-amber-800">Clear by Prayer</span>
            </button>
            <button 
              onClick={handleClearAll}
              className="flex items-center justify-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl shadow-sm active:scale-95 transition-transform hover:bg-red-100"
            >
              <Trash2 size={16} className="text-red-600" />
              <span className="font-medium text-sm text-red-800">Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-emerald-500 text-white rounded-3xl shadow-lg shadow-emerald-500/20">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Total Present</p>
          <h3 className="text-4xl font-bold font-heading">{hasData ? `${summary.presentPercentage}%` : '--'}</h3>
          <p className="text-xs text-emerald-100 mt-2">{hasData ? `${summary.totalPresent} students` : 'No data yet'}</p>
        </div>
        <div className="p-5 bg-red-50 text-red-900 rounded-3xl border border-red-100">
          <p className="text-red-400 text-xs font-medium uppercase tracking-wider mb-1">Absentees</p>
          <h3 className="text-4xl font-bold font-heading">{hasData ? summary.totalAbsent : '--'}</h3>
          <p className="text-xs text-red-400 mt-2">{hasData ? 'Today' : 'No data yet'}</p>
        </div>
      </div>

      {/* Class Summary by Prayer with Edit/Delete */}
      {classSummaries.length > 0 && (
        <div className="space-y-4">
          {classSummaries.map((prayerSummary) => (
            <div key={prayerSummary.prayer} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{prayerSummary.prayer}</h3>
                {isAdmin && (
                  <button
                    onClick={() => handleClearPrayer(prayerSummary.prayer)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={`Clear ${prayerSummary.prayer} attendance`}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {prayerSummary.classes.map((cls) => (
                  <div 
                    key={cls.className} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl relative group",
                      cls.percentage === 100 
                        ? "bg-emerald-50 border border-emerald-200" 
                        : cls.percentage >= 90 
                          ? "bg-green-50 border border-green-200"
                          : cls.percentage >= 80
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-red-50 border border-red-200"
                    )}
                  >
                    <span className="font-medium text-sm">{cls.className}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-bold text-sm",
                        cls.percentage === 100 
                          ? "text-emerald-600" 
                          : cls.percentage >= 90 
                            ? "text-green-600"
                            : cls.percentage >= 80
                              ? "text-amber-600"
                              : "text-red-600"
                      )}>
                        {cls.percentage}%
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            const store = getAttendanceStore();
                            const prayerStore = store[prayerSummary.prayer] || {};
                            const classEntry = Object.entries(prayerStore).find(([, data]) => data.className === cls.className);
                            if (classEntry) {
                              handleEditAttendance(prayerSummary.prayer, classEntry[0]);
                            }
                          }}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                          title="Edit attendance"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data Message */}
      {!hasData && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center">
          <p className="text-muted-foreground">No attendance recorded yet today.</p>
          <p className="text-sm text-muted-foreground mt-2">Start marking attendance to see your summary here.</p>
        </div>
      )}

      {/* Recent Activity with Edit/Delete */}
      {summary && summary.recentLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold px-1">Recent Logs</h3>
          <div className="space-y-3">
            {summary.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                <div>
                  <h4 className="font-medium">{log.prayer} - {log.className}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">{log.presentCount}</span>
                    <span className="text-sm text-muted-foreground">/{log.totalStudents}</span>
                    {log.absentCount > 0 && (
                      <p className="text-xs text-red-500">{log.absentCount} absent</p>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleEditAttendance(log.prayer, log.classId)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit attendance"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear by Prayer Dialog */}
      <Dialog open={clearPrayerDialogOpen} onOpenChange={setClearPrayerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Attendance by Prayer</DialogTitle>
            <DialogDescription>Select a prayer to clear its attendance data</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-4">
            {PRAYERS.map((prayer) => (
              <button
                key={prayer}
                onClick={() => {
                  handleClearPrayer(prayer);
                  setClearPrayerDialogOpen(false);
                }}
                className="flex items-center justify-between p-4 bg-secondary/50 hover:bg-red-50 border border-border hover:border-red-200 rounded-xl transition-all"
              >
                <span className="font-medium">{prayer}</span>
                <Trash2 size={18} className="text-red-500" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
