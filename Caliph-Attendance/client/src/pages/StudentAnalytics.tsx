import { useState, useEffect } from "react";
import { ArrowLeft, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { getAllStudentsAttendance, getClassWideSummary } from "@/lib/attendanceStore";
import { STUDENTS, CLASSES } from "@/lib/mockData";

const TABS = ['All Students'];

export default function StudentAnalytics() {
  const [activeTab, setActiveTab] = useState('All Students');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Record<string, any>>({});
  const [classSummary, setClassSummary] = useState<any>(null);

  useEffect(() => {
    // Build student list from all classes
    const studentList: Record<string, any> = {};
    
    CLASSES.forEach((cls: any) => {
      const classStudents = STUDENTS[cls.id] || [];
      classStudents.forEach((student: any) => {
        studentList[student.id] = {
          name: student.name,
          rollNo: student.rollNo,
          className: cls.name,
          percentage: 100
        };
      });
    });
    
    setAllStudents(studentList);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const summary = getClassWideSummary(selectedClass);
      setClassSummary(summary);
    }
  }, [selectedClass]);

  const classes = CLASSES;
  const sortedStudents = Object.entries(allStudents)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background pb-24">
      <div className="flex items-center space-x-4 pt-4">
        <Link href="/summary" className="p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading">Student Analytics</h1>
          <p className="text-sm text-muted-foreground">Individual & class attendance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-secondary rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedStudent(null);
            }}
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

      {/* All Students Tab */}
      {activeTab === 'All Students' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {sortedStudents.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "p-4 bg-card border rounded-xl cursor-pointer transition-all hover:shadow-md",
                  student.percentage === 100
                    ? "border-emerald-200"
                    : student.percentage >= 80
                      ? "border-amber-200"
                      : "border-red-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{student.rollNo}. {student.name}</h4>
                    <p className="text-xs text-muted-foreground">{student.className}</p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-bold",
                      student.percentage === 100
                        ? "text-emerald-600"
                        : student.percentage >= 80
                          ? "text-amber-600"
                          : "text-red-600"
                    )}>
                      {student.percentage}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {student.presentCount} Present
                    </p>
                  </div>
                </div>
                {student.absentCount > 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    {student.absentCount} Absent
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Class Tab */}
      {activeTab === 'By Class' && !selectedClass && (
        <div className="grid grid-cols-2 gap-3">
          {classes.map((cls: any) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.name)}
              className="p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors text-left"
            >
              <h4 className="font-medium text-sm">{cls.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{cls.students} students</p>
            </button>
          ))}
        </div>
      )}

      {/* Class Summary */}
      {activeTab === 'By Class' && selectedClass && classSummary && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedClass(null)}
            className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back to Classes
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs text-emerald-600 font-medium uppercase">Avg Attendance</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{classSummary.averagePercentage}%</h3>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-600 font-medium uppercase">Total Present</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{classSummary.totalPresent}</h3>
            </div>
          </div>

          <div className="space-y-3">
            {classSummary.students.map((student: any) => (
              <div
                key={student.id}
                className={cn(
                  "p-4 bg-card border rounded-xl",
                  student.percentage === 100
                    ? "border-emerald-200 bg-emerald-50"
                    : student.percentage >= 80
                      ? "border-amber-200 bg-amber-50"
                      : "border-red-200 bg-red-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{student.rollNo}. {student.name}</h4>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    student.percentage === 100
                      ? "text-emerald-600"
                      : student.percentage >= 80
                        ? "text-amber-600"
                        : "text-red-600"
                  )}>
                    {student.percentage}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {student.presentCount} Present • {student.absentCount} Absent
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
