export interface Student {
  id: string;
  name: string;
  rollNo: number;
  classId: string;
  gender: 'M' | 'F';
}

export interface ClassGroup {
  id: string;
  name: string;
  students: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  prayer: string; // 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Other'
  classId: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
}

export const CLASSES: ClassGroup[] = [
  { id: 'S1A', name: 'S1-A', students: 30 },
  { id: 'S1B', name: 'S1-B', students: 28 },
  { id: 'S2A', name: 'S2-A', students: 32 },
  { id: 'S2B', name: 'S2-B', students: 29 },
  { id: 'S3A', name: 'S3-A', students: 31 },
  { id: 'S3B', name: 'S3-B', students: 30 },
];

export const STUDENTS: Record<string, Student[]> = {};

export const MOCK_HISTORY: AttendanceRecord[] = [];
