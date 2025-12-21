import { useState, useEffect } from "react";
import { ArrowLeft, Download, FileText, Loader } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { getAttendanceStore } from "@/lib/attendanceStore";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface StudentData {
  id: string;
  name: string;
  rollNo: number;
  absentCount: number;
  percentage: number;
}

interface ClassData {
  id: string;
  name: string;
  students: StudentData[];
}

export default function StudentAnalytics() {
  const [classData, setClassData] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classes, allStudents] = await Promise.all([
        api.getClasses(),
        api.getStudents(),
      ]);

      const store = getAttendanceStore();

      const processedClasses: ClassData[] = classes.map((cls) => {
        const classStudents = allStudents.filter(
          (student) => student.classId === cls.id
        );

        const studentList = classStudents.map((student) => {
          let totalAbsences = 0;

          // Count absences across all prayers
          Object.values(store).forEach((prayerData) => {
            const classAttendance = prayerData[cls.id];
            if (classAttendance) {
              const isAbsent = classAttendance.absentStudents.some(
                (s) => s.rollNo === student.rollNo
              );
              if (isAbsent) totalAbsences++;
            }
          });

          // Calculate percentage: 100% - (5% per absence)
          const percentage = Math.max(0, 100 - totalAbsences * 5);

          return {
            id: student.id,
            name: student.name,
            rollNo: student.rollNo,
            absentCount: totalAbsences,
            percentage,
          };
        });

        return {
          id: cls.id,
          name: cls.name,
          students: studentList,
        };
      });

      setClassData(processedClasses);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for custom events when classes or students are added
    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener("classDataChanged", handleDataChange);
    window.addEventListener("attendanceDataChanged", handleDataChange);

    return () => {
      window.removeEventListener("classDataChanged", handleDataChange);
      window.removeEventListener("attendanceDataChanged", handleDataChange);
    };
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 8;

    // Title
    doc.setFontSize(16);
    doc.text("Student Attendance Report", margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);

    classData.forEach((cls) => {
      // Check if we need a new page
      if (yPosition + cls.students.length * lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Class header
      doc.setFont("helvetica", "bold");
      doc.text(cls.name, margin, yPosition);
      yPosition += lineHeight;
      doc.setFont("helvetica", "normal");

      // Students
      cls.students.forEach((student) => {
        doc.text(
          `${student.rollNo}. ${student.name} - ${student.percentage}%`,
          margin + 5,
          yPosition
        );
        yPosition += lineHeight;
      });

      yPosition += 5; // Space between classes
    });

    doc.save("attendance-report.pdf");
  };

  const downloadExcel = () => {
    const data: any[] = [];

    classData.forEach((cls) => {
      data.push({ Class: cls.name, Student: "", Percentage: "" });
      cls.students.forEach((student) => {
        data.push({
          Class: "",
          Student: `${student.rollNo}. ${student.name}`,
          Percentage: `${student.percentage}%`,
        });
      });
      data.push({});
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = [{ wch: 15 }, { wch: 25 }, { wch: 12 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance-report.xlsx");
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 pt-4">
          <Link
            href="/summary"
            className="p-2 bg-secondary rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-heading">Student Analytics</h1>
            <p className="text-sm text-muted-foreground">Class-based attendance overview</p>
          </div>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3">
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          <FileText size={18} />
          Download PDF
        </button>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          <Download size={18} />
          Download Excel
        </button>
      </div>

      {/* Class-based Student View */}
      {classData.length > 0 ? (
        <div className="space-y-8">
          {classData.map((cls) => (
            <div key={cls.id} className="bg-card border border-border rounded-xl p-6">
              {/* Class Header */}
              <h2 className="text-2xl font-bold text-foreground mb-6 pb-4 border-b border-border">
                {cls.name}
              </h2>

              {/* Students List */}
              {cls.students.length > 0 ? (
                <div className="space-y-3">
                  {cls.students.map((student) => (
                    <div
                      key={student.id}
                      className={cn(
                        "p-4 rounded-lg flex items-center justify-between border transition-all",
                        student.percentage === 100
                          ? "bg-emerald-50 border-emerald-200"
                          : student.percentage >= 80
                            ? "bg-amber-50 border-amber-200"
                            : "bg-red-50 border-red-200"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {student.rollNo}. {student.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-2xl font-bold",
                            student.percentage === 100
                              ? "text-emerald-600"
                              : student.percentage >= 80
                                ? "text-amber-600"
                                : "text-red-600"
                          )}
                        >
                          {student.percentage}%
                        </div>
                        {student.absentCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {student.absentCount} absence{student.absentCount !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students in this class.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No classes or students found. Create classes and add students first.
          </p>
        </div>
      )}
    </div>
  );
}
