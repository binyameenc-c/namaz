import { STUDENTS, type Student } from "./mockData";

export interface ClassAttendance {
  classId: string;
  className: string;
  totalStudents: number;
  presentCount: number;
  absentStudents: { name: string; rollNo: number }[];
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
  students: Student[]
): void {
  const store = getAttendanceStore();
  
  if (!store[prayerType]) {
    store[prayerType] = {};
  }
  
  const absentStudents = students
    .filter((s) => attendance[s.id] === "absent")
    .map((s) => ({ name: s.name, rollNo: s.rollNo }));
  
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
      message += `${classData.className} All present\n`;
    } else {
      const absentNames = classData.absentStudents.map((s) => s.name).join(", ");
      message += `${classData.className} ${absentNames}\n`;
    }
  });
  
  return message.trim();
}

export function getSummaryLines(prayerType: string): { className: string; status: string; isAllPresent: boolean }[] {
  const prayerData = getPrayerAttendance(prayerType);
  const classIds = Object.keys(prayerData);
  
  return classIds.map((classId) => {
    const classData = prayerData[classId];
    const isAllPresent = classData.absentStudents.length === 0;
    const status = isAllPresent 
      ? "All present" 
      : classData.absentStudents.map((s) => s.name).join(", ");
    
    return { className: classData.className, status, isAllPresent };
  });
}

export function clearPrayerAttendance(prayerType: string): void {
  const store = getAttendanceStore();
  delete store[prayerType];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
