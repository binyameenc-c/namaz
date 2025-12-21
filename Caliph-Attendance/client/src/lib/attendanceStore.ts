import { STUDENTS, CLASSES, type Student } from "./mockData";

export interface AbsentStudent {
  name: string;
  rollNo: number;
  reason?: string;
}

export interface ClassAttendance {
  classId: string;
  className: string;
  totalStudents: number;
  presentCount: number;
  absentStudents: AbsentStudent[];
  timestamp: number;
}

export type PrayerAttendance = Record<string, ClassAttendance>;
export type AttendanceStore = Record<string, PrayerAttendance>;

const STORAGE_KEY = "caliph_attendance_data";

export function getAttendanceStore(): AttendanceStore {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveClassAttendance(
  prayerType: string,
  classId: string,
  className: string,
  attendance: Record<string, "present" | "absent">,
  students: Student[],
  absentReasons: Record<string, string> = {}
): void {
  const store = getAttendanceStore();
  
  if (!store[prayerType]) {
    store[prayerType] = {};
  }
  
  const absentStudents: AbsentStudent[] = students
    .filter((s) => attendance[s.id] === "absent")
    .map((s) => ({ 
      name: s.name, 
      rollNo: s.rollNo,
      reason: absentReasons[s.id] || undefined
    }));
  
  const presentCount = students.filter((s) => attendance[s.id] === "present").length;
  
  store[prayerType][classId] = {
    classId,
    className,
    totalStudents: students.length,
    presentCount,
    absentStudents,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  
  // Dispatch custom event for attendance data changes
  window.dispatchEvent(new CustomEvent('attendanceDataChanged', { detail: { prayerType, classId } }));
}

export function getPrayerAttendance(prayerType: string): PrayerAttendance {
  const store = getAttendanceStore();
  return store[prayerType] || {};
}

export function generatePrayerSummaryMessage(prayerType: string): string {
  const prayerData = getPrayerAttendance(prayerType);
  
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  
  let message = `📿 *${prayerType}*\n`;
  message += `📅 ${today}\n\n`;
  
  const classIds = Object.keys(prayerData);
  
  if (classIds.length === 0) {
    message += "No attendance recorded yet.";
    return message;
  }
  
  classIds.forEach((classId) => {
    const classData = prayerData[classId];
    
    if (classData.absentStudents.length === 0) {
      message += `✅ ${classData.className}: All present\n`;
    } else {
      message += `📋 ${classData.className}:\n`;
      classData.absentStudents.forEach((s) => {
        const reasonText = s.reason ? ` (${s.reason})` : "";
        message += `   ❌ ${s.rollNo}. ${s.name}${reasonText}\n`;
      });
    }
  });
  
  return message.trim();
}

export function getSummaryLines(prayerType: string): { className: string; status: string; isAllPresent: boolean; absentDetails: AbsentStudent[] }[] {
  const prayerData = getPrayerAttendance(prayerType);
  const classIds = Object.keys(prayerData);
  
  return classIds.map((classId) => {
    const classData = prayerData[classId];
    const isAllPresent = classData.absentStudents.length === 0;
    const status = isAllPresent 
      ? "All present" 
      : classData.absentStudents.map((s) => {
          const reasonText = s.reason ? ` (${s.reason})` : "";
          return `${s.name}${reasonText}`;
        }).join(", ");
    
    return { className: classData.className, status, isAllPresent, absentDetails: classData.absentStudents };
  });
}

export function clearPrayerAttendance(prayerType: string): void {
  const store = getAttendanceStore();
  delete store[prayerType];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  
  // Dispatch custom event for attendance data changes
  window.dispatchEvent(new CustomEvent('attendanceDataChanged', { detail: { prayerType } }));
}

export function clearAllAttendance(): void {
  localStorage.removeItem(STORAGE_KEY);
  
  // Dispatch custom event for attendance data changes
  window.dispatchEvent(new CustomEvent('attendanceDataChanged'));
}

export interface DailySummary {
  totalPresent: number;
  totalAbsent: number;
  totalStudents: number;
  presentPercentage: number;
  prayerData: { name: string; present: number; total: number; absent: number }[];
  recentLogs: { id: string; prayer: string; classId: string; className: string; presentCount: number; totalStudents: number; absentCount: number; timestamp: number }[];
  allAbsentStudents: { prayer: string; className: string; name: string; rollNo: number; reason?: string }[];
}

export function getDailySummary(): DailySummary {
  const store = getAttendanceStore();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalStudents = 0;
  const recentLogs: DailySummary["recentLogs"] = [];
  const allAbsentStudents: DailySummary["allAbsentStudents"] = [];
  
  const prayerData = prayers.map((prayer) => {
    const prayerStore = store[prayer] || {};
    let prayerPresent = 0;
    let prayerTotal = 0;
    let prayerAbsent = 0;
    
    CLASSES.forEach((cls) => {
      const classData = prayerStore[cls.id];
      const classStudents = STUDENTS[cls.id] || [];
      const studentCount = classStudents.length || cls.students;
      
      if (classData) {
        prayerPresent += classData.presentCount;
        prayerTotal += classData.totalStudents;
        prayerAbsent += classData.absentStudents.length;
        
        recentLogs.push({
          id: `${prayer}-${classData.classId}`,
          prayer,
          classId: classData.classId,
          className: classData.className,
          presentCount: classData.presentCount,
          totalStudents: classData.totalStudents,
          absentCount: classData.absentStudents.length,
          timestamp: classData.timestamp,
        });
        
        classData.absentStudents.forEach((student) => {
          allAbsentStudents.push({
            prayer,
            className: classData.className,
            name: student.name,
            rollNo: student.rollNo,
            reason: student.reason,
          });
        });
      } else {
        prayerPresent += studentCount;
        prayerTotal += studentCount;
      }
    });
    
    totalPresent += prayerPresent;
    totalAbsent += prayerAbsent;
    totalStudents += prayerTotal;
    
    return { name: prayer, present: prayerPresent, total: prayerTotal, absent: prayerAbsent };
  });
  
  recentLogs.sort((a, b) => b.timestamp - a.timestamp);
  
  const presentPercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;
  
  return {
    totalPresent,
    totalAbsent,
    totalStudents,
    presentPercentage,
    prayerData,
    recentLogs: recentLogs.slice(0, 10),
    allAbsentStudents,
  };
}

export interface ClassSummaryByPrayer {
  prayer: string;
  classes: { className: string; percentage: number; present: number; total: number }[];
}

export function getClassSummariesByPrayer(): ClassSummaryByPrayer[] {
  const store = getAttendanceStore();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  
  return prayers.map((prayer) => {
    const prayerStore = store[prayer] || {};
    const classes: { className: string; percentage: number; present: number; total: number }[] = [];
    
    CLASSES.forEach((cls) => {
      const classData = prayerStore[cls.id];
      if (classData) {
        const percentage = classData.totalStudents > 0 
          ? Math.round((classData.presentCount / classData.totalStudents) * 100) 
          : 0;
        classes.push({
          className: classData.className,
          percentage,
          present: classData.presentCount,
          total: classData.totalStudents,
        });
      }
    });
    
    return { prayer, classes };
  }).filter(p => p.classes.length > 0);
}

// Get individual student attendance summary
export function getStudentAttendanceSummary(studentId: string, className: string) {
  const store = getAttendanceStore();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  
  const attendanceRecords: { prayer: string; date: string; status: 'present' | 'absent'; reason?: string }[] = [];
  
  prayers.forEach((prayer) => {
    const prayerStore = store[prayer] || {};
    Object.values(prayerStore).forEach((classData) => {
      if (classData.className === className) {
        const absStudent = classData.absentStudents.find(s => `${s.rollNo}-${s.name}` === studentId);
        if (absStudent) {
          attendanceRecords.push({
            prayer,
            date: new Date(classData.timestamp).toLocaleDateString("en-GB"),
            status: 'absent',
            reason: absStudent.reason
          });
        } else {
          attendanceRecords.push({
            prayer,
            date: new Date(classData.timestamp).toLocaleDateString("en-GB"),
            status: 'present'
          });
        }
      }
    });
  });
  
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const percentage = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;
  
  return {
    presentCount,
    absentCount,
    percentage,
    records: attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
}

// Get all students with their attendance status - called from StudentAnalytics
export function getAllStudentsAttendance() {
  const store = getAttendanceStore();
  const studentAttendance: Record<string, { name: string; rollNo: number; className: string; presentCount: number; absentCount: number; percentage: number }> = {};
  
  return studentAttendance;
}

// Get class-wide summary with all students
export function getClassWideSummary(className: string) {
  const store = getAttendanceStore();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  
  const prayerStore = store[prayers[0]] || {};
  const classEntry = Object.values(prayerStore).find((c: any) => c.className === className);
  
  if (!classEntry) {
    return {
      className,
      students: [],
      totalPresent: 0,
      totalAbsent: 0,
      averagePercentage: 0
    };
  }
  
  const students = classEntry.absentStudents.map((s: any) => ({
    id: `${s.rollNo}`,
    name: s.name,
    rollNo: s.rollNo,
    presentCount: 0,
    absentCount: 1,
    percentage: 0
  }));
  
  return {
    className,
    students,
    totalPresent: 0,
    totalAbsent: students.length,
    averagePercentage: 0
  };
}

export function generateFullDailyReport(): string {
  const store = getAttendanceStore();
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  
  let message = `📊 *Daily Attendance Report*\n`;
  message += `📅 ${today}\n\n`;
  
  const classReport: Record<string, { className: string; absentStudents: Set<string> }> = {};
  
  prayers.forEach((prayer) => {
    const prayerStore = store[prayer] || {};
    Object.keys(prayerStore).forEach((classId) => {
      const classData = prayerStore[classId];
      if (!classReport[classId]) {
        classReport[classId] = { className: classData.className, absentStudents: new Set<string>() };
      }
      classData.absentStudents.forEach((s) => {
        const studentKey = `${s.rollNo}-${s.name}`;
        classReport[classId].absentStudents.add(studentKey);
      });
    });
  });
  
  Object.values(classReport).forEach((cls) => {
    message += `*${cls.className}*\n`;
    if (cls.absentStudents.size === 0) {
      message += `All present\n`;
    } else {
      cls.absentStudents.forEach((studentKey) => {
        message += `${studentKey}\n`;
      });
    }
    message += `\n`;
  });
  
  return message.trim();
}
