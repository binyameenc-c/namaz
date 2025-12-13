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

const DEFAULT_CLASSES: ClassGroup[] = [
  { id: 'S1A', name: 'S1-A', students: 30 },
  { id: 'S1B', name: 'S1-B', students: 28 },
  { id: 'S2A', name: 'S2-A', students: 32 },
  { id: 'S2B', name: 'S2-B', students: 29 },
  { id: 'S3A', name: 'S3-A', students: 31 },
  { id: 'S3B', name: 'S3-B', students: 30 },
];

const CLASSES_STORAGE_KEY = "caliph_classes";
const STUDENTS_STORAGE_KEY = "caliph_students";

export function getClasses(): ClassGroup[] {
  try {
    const data = localStorage.getItem(CLASSES_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_CLASSES;
  } catch {
    return DEFAULT_CLASSES;
  }
}

export function saveClasses(classes: ClassGroup[]): void {
  localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
}

export function addClass(name: string, students: number): ClassGroup {
  const classes = getClasses();
  const id = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const newClass = { id, name, students };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
}

export function updateClass(id: string, name: string, students: number): void {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    classes[index] = { id, name, students };
    saveClasses(classes);
  }
}

export function deleteClass(id: string): void {
  const classes = getClasses();
  const filtered = classes.filter(c => c.id !== id);
  saveClasses(filtered);
  
  const students = getStudents();
  delete students[id];
  saveStudents(students);
}

export function getStudents(): Record<string, Student[]> {
  try {
    const data = localStorage.getItem(STUDENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveStudents(students: Record<string, Student[]>): void {
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
}

export function addStudent(classId: string, name: string, gender: 'M' | 'F'): Student {
  const students = getStudents();
  if (!students[classId]) {
    students[classId] = [];
  }
  const rollNo = students[classId].length + 1;
  const id = `${classId.toLowerCase()}-${rollNo}`;
  const newStudent: Student = { id, name, rollNo, classId, gender };
  students[classId].push(newStudent);
  saveStudents(students);
  
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    classes[classIndex].students = students[classId].length;
    saveClasses(classes);
  }
  
  return newStudent;
}

export function deleteStudent(classId: string, studentId: string): void {
  const students = getStudents();
  if (students[classId]) {
    students[classId] = students[classId].filter(s => s.id !== studentId);
    students[classId] = students[classId].map((s, i) => ({ ...s, rollNo: i + 1 }));
    saveStudents(students);
    
    const classes = getClasses();
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
      classes[classIndex].students = students[classId].length;
      saveClasses(classes);
    }
  }
}

export const CLASSES = getClasses();

export const STUDENTS = getStudents();

export const MOCK_HISTORY: AttendanceRecord[] = [];
