import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Users, ChevronRight, Share2, Check, Trash2 } from "lucide-react";
import { CLASSES } from "@/lib/mockData";
import { motion } from "framer-motion";
import { getPrayerAttendance, generatePrayerSummaryMessage, clearPrayerAttendance } from "@/lib/attendanceStore";

export default function ClassSelect() {
  const [match, params] = useRoute("/select-class/:type");
  const type = params?.type || "Fajr";
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});

  useEffect(() => {
    setAttendanceData(getPrayerAttendance(type));
  }, [type]);

  const refreshData = () => {
    setAttendanceData(getPrayerAttendance(type));
  };

  const shareOnWhatsApp = () => {
    const message = generatePrayerSummaryMessage(type);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleClearAttendance = () => {
    clearPrayerAttendance(type);
    setAttendanceData({});
  };

  const recordedClassCount = Object.keys(attendanceData).length;

  return (
    <div className="min-h-screen bg-background p-6 pb-28 space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <a className="p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
              <ArrowLeft size={20} />
            </a>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading">{type}</h1>
            <p className="text-sm text-muted-foreground">Select a class to continue</p>
          </div>
        </div>
        {recordedClassCount > 0 && (
          <button
            onClick={handleClearAttendance}
            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
            title="Clear today's attendance"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {recordedClassCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-sm text-emerald-700 font-medium">
            {recordedClassCount} of {CLASSES.length} classes recorded
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {CLASSES.map((cls, idx) => {
          const classAttendance = attendanceData[cls.id];
          const isRecorded = !!classAttendance;
          
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/attendance/${type}/${cls.id}`}>
                <a className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:bg-secondary/50 group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${isRecorded ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      {isRecorded ? <Check size={22} /> : <Users size={22} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{cls.name}</h3>
                      {isRecorded ? (
                        <p className="text-sm text-emerald-600">
                          {classAttendance.absentStudents.length === 0 
                            ? "All present" 
                            : `${classAttendance.absentStudents.length} absent`}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{cls.students} Students</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                </a>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {recordedClassCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-20">
          <button 
            onClick={shareOnWhatsApp}
            className="w-full bg-[#25D366] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-[#25D366]/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Share2 size={20} />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
}
