import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDailySummary, generateFullDailyReport, type DailySummary } from "@/lib/attendanceStore";
import { jsPDF } from "jspdf";

const TABS = ['Daily', 'Weekly', 'Monthly'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Daily');
  const { toast } = useToast();
  const [summary, setSummary] = useState<DailySummary | null>(null);

  useEffect(() => {
    setSummary(getDailySummary());
  }, []);

  const handleDownload = () => {
    if (!summary) return;
    
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
    
    doc.setFontSize(14);
    doc.text(`Present: ${summary.totalPresent} (${summary.presentPercentage}%)`, 20, 45);
    doc.text(`Absent: ${summary.totalAbsent}`, 20, 55);
    
    let yPos = 75;
    
    doc.setFontSize(14);
    doc.text("Prayer Summary:", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    summary.prayerData.forEach((prayer) => {
      if (prayer.total > 0) {
        const percentage = Math.round((prayer.present / prayer.total) * 100);
        doc.text(`${prayer.name}: ${prayer.present}/${prayer.total} (${percentage}%)`, 25, yPos);
        yPos += 8;
      }
    });
    
    if (summary.allAbsentStudents.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text("Absent Students:", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      let currentPrayer = "";
      summary.allAbsentStudents.forEach((student) => {
        if (student.prayer !== currentPrayer) {
          currentPrayer = student.prayer;
          doc.setFont("helvetica", "bold");
          doc.text(currentPrayer, 25, yPos);
          yPos += 7;
          doc.setFont("helvetica", "normal");
        }
        const reasonText = student.reason ? ` (${student.reason})` : "";
        doc.text(`${student.className}: ${student.rollNo}. ${student.name}${reasonText}`, 30, yPos);
        yPos += 6;
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
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

  const chartData = summary?.prayerData.filter(p => p.total > 0) || [];
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
          <span className="font-semibold text-sm">Download PDF</span>
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
          <span className="font-semibold text-sm text-emerald-800">Share Report</span>
        </button>
      </div>

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

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold mb-6">Prayer Attendance</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#888' }} 
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string, props: any) => {
                    const total = props.payload.total;
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return [`${value}/${total} (${percentage}%)`, 'Present'];
                  }}
                />
                <Bar dataKey="present" radius={[6, 6, 6, 6]} barSize={32}>
                  {chartData.map((entry, index) => {
                    const percentage = entry.total > 0 ? (entry.present / entry.total) * 100 : 0;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={percentage > 90 ? '#10b981' : percentage > 80 ? '#34d399' : '#f87171'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!hasData && (
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center">
          <p className="text-muted-foreground">No attendance recorded yet today.</p>
          <p className="text-sm text-muted-foreground mt-2">Start marking attendance to see your summary here.</p>
        </div>
      )}

      {/* Recent Activity */}
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
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600">{log.presentCount}</span>
                  <span className="text-sm text-muted-foreground">/{log.totalStudents}</span>
                  {log.absentCount > 0 && (
                    <p className="text-xs text-red-500">{log.absentCount} absent</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
