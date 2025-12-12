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

export const STUDENTS: Record<string, Student[]> = {
  'S1A': Array.from({ length: 30 }, (_, i) => ({
    id: `s1a-${i + 1}`,
    name: `Student ${i + 1}`,
    rollNo: i + 1,
    classId: 'S1A',
    gender: 'M'
  })),
  'S1B': Array.from({ length: 28 }, (_, i) => ({
    id: `s1b-${i + 1}`,
    name: `Student ${i + 1}`,
    rollNo: i + 1,
    classId: 'S1B',
    gender: 'M'
  })),
  'S2A': Array.from({ length: 32 }, (_, i) => ({
    id: `s2a-${i + 1}`,
    name: `Student ${i + 1}`,
    rollNo: i + 1,
    classId: 'S2A',
    gender: 'M'
  })),
  'S2B': Array.from({ length: 29 }, (_, i) => ({
    id: `s2b-${i + 1}`,
    name: `Student ${i + 1}`,
    rollNo: i + 1,
    classId: 'S2B',
    gender: 'M'
  })),
};

export const MOCK_HISTORY: AttendanceRecord[] = [
  { id: '1', date: '2025-05-10', prayer: 'Fajr', classId: 'S1A', presentCount: 28, absentCount: 2, totalStudents: 30 },
  { id: '2', date: '2025-05-10', prayer: 'Dhuhr', classId: 'S1A', presentCount: 29, absentCount: 1, totalStudents: 30 },
  { id: '3', date: '2025-05-10', prayer: 'Asr', classId: 'S1A', presentCount: 30, absentCount: 0, totalStudents: 30 },
  { id: '4', date: '2025-05-10', prayer: 'Fajr', classId: 'S2B', presentCount: 25, absentCount: 4, totalStudents: 29 },
];
