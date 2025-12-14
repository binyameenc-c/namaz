export interface Student {
  id: string;
  name: string;
  rollNo: number;
  classId: string;
  gender: 'M' | 'F';
  createdAt?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  students: number;
  createdAt?: string;
}

export const api = {
  async getClasses(): Promise<ClassGroup[]> {
    const response = await fetch('/api/classes');
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  async createClass(id: string, name: string): Promise<ClassGroup> {
    const response = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create class');
    }
    return response.json();
  },

  async updateClass(id: string, name: string): Promise<ClassGroup> {
    const response = await fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update class');
    return response.json();
  },

  async deleteClass(id: string): Promise<void> {
    const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete class');
  },

  async getStudents(): Promise<Student[]> {
    const response = await fetch('/api/students');
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const response = await fetch(`/api/students/class/${classId}`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async createStudent(data: { name: string; classId: string; gender: string }): Promise<Student> {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create student');
    }
    return response.json();
  },

  async createStudentsBulk(students: { name: string; rollNo?: number; gender?: string }[], classId: string): Promise<Student[]> {
    const response = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, classId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create students');
    }
    return response.json();
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  async deleteStudent(id: string): Promise<void> {
    const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete student');
  },
};
