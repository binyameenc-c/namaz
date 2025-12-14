import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Users, ChevronRight, Check, Trash2, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getPrayerAttendance, generatePrayerSummaryMessage, clearPrayerAttendance, getSummaryLines } from "@/lib/attendanceStore";
import { jsPDF } from "jspdf";

interface ClassData {
  id: string;
  name: string;
  studentCount: number;
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ClassSelect() {
  const [match, params] = useRoute("/select-class/:type");
  const type = params?.type || "Fajr";
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAttendanceData(getPrayerAttendance(type));
  }, [type]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const shareOnWhatsApp = () => {
    const message = generatePrayerSummaryMessage(type);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    doc.setFontSize(20);
    doc.text(`${type} Attendance`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(today, 20, 30);
    
    const summaryLines = getSummaryLines(type);
    let yPos = 50;
    
    if (summaryLines.length === 0) {
      doc.text("No attendance recorded yet.", 20, yPos);
    } else {
      summaryLines.forEach((line) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(line.className, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (line.isAllPresent) {
          doc.text("All present", 25, yPos);
          yPos += 6;
        } else {
          line.absentDetails.forEach((student) => {
            const reasonText = student.reason ? ` (${student.reason})` : "";
            doc.text(`${student.name}${reasonText}`, 25, yPos);
            yPos += 6;
            
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          });
        }
        yPos += 6;
      });
    }
    
    doc.save(`${type}_Attendance_${today.replace(/\s/g, "_")}.pdf`);
  };

  const handleClearAttendance = () => {
    clearPrayerAttendance(type);
    setAttendanceData({});
  };

  const recordedClassCount = Object.keys(attendanceData).length;
  const summaryLines = getSummaryLines(type);

  return (
    <div className="min-h-screen bg-background p-6 pb-28 space-y-6">
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
              <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading">{type}</h1>
            <p className="text-sm text-muted-foreground">Select a class to continue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={shareOnWhatsApp}
            className="p-3 bg-[#25D366] text-white rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
            title="Share on WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </button>
          <button
            onClick={downloadPDF}
            className="p-3 bg-blue-500 text-white rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
            title="Download PDF"
          >
            <Download size={20} />
          </button>
          {recordedClassCount > 0 && (
            <button
              onClick={handleClearAttendance}
              className="p-3 bg-secondary text-muted-foreground hover:text-red-500 rounded-full transition-colors"
              title="Clear attendance"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No classes created yet</p>
            <p className="text-sm">Ask admin to create classes first</p>
          </div>
        ) : (
          classes.map((cls, idx) => {
            const classAttendance = attendanceData[cls.id];
            const isRecorded = !!classAttendance;
            
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/attendance/${type}/${cls.id}`} className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:bg-secondary/50 group">
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
                          <p className="text-sm text-muted-foreground">{cls.studentCount} Students</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
