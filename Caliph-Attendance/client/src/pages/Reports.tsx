import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_HISTORY } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TABS = ['Daily', 'Weekly', 'Monthly'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Daily');
  const { toast } = useToast();

  // Transform mock data for chart
  const data = [
    { name: 'Fajr', present: 85, total: 100 },
    { name: 'Dhuhr', present: 92, total: 100 },
    { name: 'Asr', present: 88, total: 100 },
    { name: 'Maghrib', present: 95, total: 100 },
    { name: 'Isha', present: 78, total: 100 },
  ];

  const handleDownload = () => {
    toast({
      title: "Downloading Report",
      description: "Your PDF summary is being generated...",
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
    });
    // In a real app, this would trigger a file download
    setTimeout(() => {
       toast({
        title: "Download Complete",
        description: "Attendance_Summary_2025.pdf saved.",
      });
    }, 1500);
  };

  const handleShare = () => {
    // WhatsApp URL scheme
    const text = "As-salamu alaykum. Here is the daily attendance summary for Caliph School: 88% Present, 12 Absent.";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-background pb-24">
      <header className="pt-6">
        <h1 className="text-3xl font-bold font-heading">Reports</h1>
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
          <h3 className="text-4xl font-bold font-heading">88%</h3>
          <p className="text-xs text-emerald-100 mt-2">+2.5% vs last week</p>
        </div>
        <div className="p-5 bg-red-50 text-red-900 rounded-3xl border border-red-100">
          <p className="text-red-400 text-xs font-medium uppercase tracking-wider mb-1">Absentees</p>
          <h3 className="text-4xl font-bold font-heading">12</h3>
          <p className="text-xs text-red-400 mt-2">Avg. per day</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="font-semibold mb-6">Prayer Attendance</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              />
              <Bar dataKey="present" radius={[6, 6, 6, 6]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.present > 90 ? '#10b981' : entry.present > 80 ? '#34d399' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="font-semibold px-1">Recent Logs</h3>
        <div className="space-y-3">
          {MOCK_HISTORY.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
              <div>
                <h4 className="font-medium">{log.prayer} - {log.classId}</h4>
                <p className="text-xs text-muted-foreground">{log.date}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">{log.presentCount}</span>
                <span className="text-sm text-muted-foreground">/{log.totalStudents}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
